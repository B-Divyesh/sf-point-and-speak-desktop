use base64::{engine::general_purpose::STANDARD, Engine};
use image::{imageops, DynamicImage, ImageOutputFormat, RgbaImage};
use screenshots::Screen;
use std::io::Cursor;
use std::thread;
use std::time::Duration;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// The only deliberate ways the UI can request pixels from the desktop.
/// Keeping this boundary in the native crate prevents background capture from
/// being introduced by accident.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum CaptureAction {
    Button,
    Shortcut,
    Again,
}

impl CaptureAction {
    fn from_source(source: &str) -> Result<Self, String> {
        match source {
            "button" => Ok(Self::Button),
            "shortcut" => Ok(Self::Shortcut),
            "again" => Ok(Self::Again),
            _ => {
                Err("screen capture requires Capture screen or the configured shortcut".to_string())
            }
        }
    }
}

trait CaptureBackend {
    fn capture(&mut self) -> Result<String, String>;
}

/// The single native gateway to screen pixels. There is no startup, timer, or
/// background caller: an explicit UI action is required before the backend is
/// reachable.
fn capture_after_explicit_action<B: CaptureBackend>(
    backend: &mut B,
    _action: CaptureAction,
) -> Result<String, String> {
    backend.capture()
}

fn capture_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
}

struct DesktopCapture<'a> {
    window: &'a tauri::WebviewWindow,
}

impl CaptureBackend for DesktopCapture<'_> {
    fn capture(&mut self) -> Result<String, String> {
        self.window
            .hide()
            .map_err(|error| format!("capture window could not hide: {error}"))?;
        thread::sleep(Duration::from_millis(180));

        let result = (|| {
            let screens = Screen::all().map_err(|error| format!("screen list failed: {error}"))?;
            if screens.is_empty() {
                return Err("no display was found".to_string());
            }
            let left = screens
                .iter()
                .map(|screen| screen.display_info.x)
                .min()
                .unwrap();
            let top = screens
                .iter()
                .map(|screen| screen.display_info.y)
                .min()
                .unwrap();
            let right = screens
                .iter()
                .map(|screen| screen.display_info.x + screen.display_info.width as i32)
                .max()
                .unwrap();
            let bottom = screens
                .iter()
                .map(|screen| screen.display_info.y + screen.display_info.height as i32)
                .max()
                .unwrap();
            let mut frame = RgbaImage::new((right - left) as u32, (bottom - top) as u32);
            for screen in screens {
                let display = screen
                    .capture()
                    .map_err(|error| format!("screen capture failed: {error}"))?;
                imageops::overlay(
                    &mut frame,
                    &display,
                    i64::from(screen.display_info.x - left),
                    i64::from(screen.display_info.y - top),
                );
            }
            let mut bytes = Cursor::new(Vec::new());
            DynamicImage::ImageRgba8(frame)
                .write_to(&mut bytes, ImageOutputFormat::Png)
                .map_err(|error| format!("screen image failed: {error}"))?;
            Ok(format!(
                "data:image/png;base64,{}",
                STANDARD.encode(bytes.into_inner())
            ))
        })();

        let _ = self.window.show();
        let _ = self.window.set_focus();
        result
    }
}

#[tauri::command]
fn capture_desktop(window: tauri::WebviewWindow, source: String) -> Result<String, String> {
    let action = CaptureAction::from_source(&source)?;
    capture_after_explicit_action(&mut DesktopCapture { window: &window }, action)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![capture_desktop])
        .setup(|app| {
            let shortcut = capture_shortcut();
            app.global_shortcut()
                .on_shortcut(shortcut, move |app, _, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("start-capture", ());
                        }
                    }
                })?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Point & Speak Desktop");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    /// @claim:configured-shortcut
    fn claim_configured_shortcut_is_ctrl_shift_space() {
        assert_eq!(
            capture_shortcut(),
            Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
        );
    }

    #[derive(Default)]
    struct FakeCaptureBackend {
        calls: usize,
    }

    impl CaptureBackend for FakeCaptureBackend {
        fn capture(&mut self) -> Result<String, String> {
            self.calls += 1;
            Ok("fixture image".to_string())
        }
    }

    #[test]
    /// @claim:capture-on-demand
    fn claim_capture_only_runs_after_an_explicit_user_action() {
        let mut button_backend = FakeCaptureBackend::default();
        assert_eq!(
            button_backend.calls, 0,
            "app startup does not capture pixels"
        );
        capture_after_explicit_action(&mut button_backend, CaptureAction::Button).unwrap();
        assert_eq!(button_backend.calls, 1, "Capture screen starts one capture");

        let mut shortcut_backend = FakeCaptureBackend::default();
        assert_eq!(
            shortcut_backend.calls, 0,
            "idle shortcut registration does not capture pixels"
        );
        capture_after_explicit_action(&mut shortcut_backend, CaptureAction::Shortcut).unwrap();
        assert_eq!(
            shortcut_backend.calls, 1,
            "the configured shortcut starts one capture"
        );

        let rejected_backend = FakeCaptureBackend::default();
        assert!(CaptureAction::from_source("startup").is_err());
        assert_eq!(
            rejected_backend.calls, 0,
            "an unrecognised source cannot capture pixels"
        );
    }
}
