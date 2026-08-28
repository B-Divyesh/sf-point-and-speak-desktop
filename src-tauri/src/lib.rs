use base64::{engine::general_purpose::STANDARD, Engine};
use image::{imageops, DynamicImage, ImageOutputFormat, RgbaImage};
use screenshots::Screen;
use std::io::Cursor;
use std::thread;
use std::time::Duration;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn capture_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
}

#[tauri::command]
fn capture_desktop(window: tauri::WebviewWindow) -> Result<String, String> {
    window
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

    let _ = window.show();
    let _ = window.set_focus();
    result
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
    /// @claim:global-shortcut
    fn claim_global_shortcut_is_ctrl_shift_space() {
        assert_eq!(
            capture_shortcut(),
            Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
        );
    }
}
