use base64::{engine::general_purpose::STANDARD, Engine};
use image::{DynamicImage, ImageOutputFormat};
use screenshots::Screen;
use std::io::Cursor;
use std::thread;
use std::time::Duration;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[tauri::command]
fn capture_primary_screen(window: tauri::WebviewWindow) -> Result<String, String> {
    window.hide().map_err(|error| format!("capture window could not hide: {error}"))?;
    thread::sleep(Duration::from_millis(180));

    let result = (|| {
        let screens = Screen::all().map_err(|error| format!("screen list failed: {error}"))?;
        let screen = screens.first().ok_or_else(|| "no display was found".to_string())?;
        let frame = screen.capture().map_err(|error| format!("screen capture failed: {error}"))?;
        let mut bytes = Cursor::new(Vec::new());
        DynamicImage::ImageRgba8(frame)
            .write_to(&mut bytes, ImageOutputFormat::Png)
            .map_err(|error| format!("screen image failed: {error}"))?;
        Ok(format!("data:image/png;base64,{}", STANDARD.encode(bytes.into_inner())))
    })();

    let _ = window.show();
    let _ = window.set_focus();
    result
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![capture_primary_screen])
        .setup(|app| {
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
            app.global_shortcut().on_shortcut(shortcut, move |app, _, event| {
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
