// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use claxon::FlacReader;
use dirs;
use metaflac::Tag;
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct TagsResponse {
    path: String,
    tags: HashMap<String, String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PcmResponse {
    sample_rate: u32,
    channels: u8,
    bits_per_sample: u8,
    total_samples: u64,
    pcm: Vec<i32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FlacTrackInfo {
    path: String,
    file_name: String,
    sample_rate: u32,
    channels: u8,
    bits_per_sample: u8,
    total_samples: Option<u64>,
    duration_ms: Option<u64>,
    tags: HashMap<String, String>,
}

#[tauri::command]
fn read_flac_tags_metaflac(path: String) -> Result<TagsResponse, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("文件不存在".into());
    }

    if p.extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase())
        != Some("flac".to_string())
    {
        return Err("不是 FLAC 文件".into());
    }

    let tag = Tag::read_from_path(&path).map_err(|e| format!("metaflac 解析失败: {}", e))?;

    let mut tags: HashMap<String, String> = HashMap::new();
    if let Some(vc) = tag.vorbis_comments() {
        for (k, values) in &vc.comments {
            let joined = values.join("; ");
            tags.insert(k.clone(), joined);
        }
    }

    Ok(TagsResponse { path, tags })
}

#[tauri::command]
fn get_default_music_dir() -> Result<Option<String>, String> {
    match dirs::audio_dir() {
        Some(p) => Ok(Some(p.to_string_lossy().to_string())),
        None => Ok(None),
    }
}

#[tauri::command]
fn list_flac_tracks(dir: Option<String>) -> Result<Vec<FlacTrackInfo>, String> {
    let default_dir = "data".to_string();
    let dir_path = dir.unwrap_or(default_dir);
    let target = Path::new(&dir_path);

    if !target.exists() {
        return Err("目录不存在".into());
    }
    if !target.is_dir() {
        return Err("路径不是目录".into());
    }

    let mut tracks = Vec::new();

    for entry in fs::read_dir(target).map_err(|e| format!("读取目录失败: {}", e))? {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let path = entry.path();

        let is_flac = path
            .extension()
            .and_then(|s| s.to_str())
            .map(|s| s.eq_ignore_ascii_case("flac"))
            .unwrap_or(false);

        if !is_flac {
            continue;
        }

        let file_name = path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or_default()
            .to_string();

        let mut tags: HashMap<String, String> = HashMap::new();
        if let Ok(tag) = Tag::read_from_path(&path) {
            if let Some(vc) = tag.vorbis_comments() {
                for (k, values) in &vc.comments {
                    let joined = values.join("; ");
                    tags.insert(k.clone(), joined);
                }
            }
        }

        let mut sample_rate = 0;
        let mut channels = 0;
        let mut bits_per_sample = 0;
        let mut total_samples: Option<u64> = None;
        let mut duration_ms: Option<u64> = None;

        if let Ok(reader) = FlacReader::open(&path) {
            let info = reader.streaminfo();
            sample_rate = info.sample_rate;
            channels = info.channels as u8;
            bits_per_sample = info.bits_per_sample as u8;
            total_samples = info.samples;
            if let (Some(samples), sr) = (info.samples, info.sample_rate) {
                if sr > 0 {
                    duration_ms = Some((samples as f64 / sr as f64 * 1000.0) as u64);
                }
            }
        }

        let path_string = path.to_string_lossy().to_string();
        tracks.push(FlacTrackInfo {
            path: path_string,
            file_name,
            sample_rate,
            channels,
            bits_per_sample,
            total_samples,
            duration_ms,
            tags,
        });
    }

    Ok(tracks)
}

#[tauri::command]
fn decode_flac_to_pcm(path: String) -> Result<PcmResponse, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("文件不存在".into());
    }

    if p.extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase())
        != Some("flac".to_string())
    {
        return Err("不是 FLAC 文件".into());
    }

    let mut reader = FlacReader::open(&path).map_err(|e| format!("FLAC 解析失败: {}", e))?;

    let info = reader.streaminfo();

    let mut pcm: Vec<i32> = Vec::new();

    for sample in reader.samples() {
        let s: i32 = sample.map_err(|e| format!("读取样本失败: {}", e))?;
        pcm.push(s);
    }

    let channels = info.channels as u8;

    let total_samples = info
        .samples
        .unwrap_or_else(|| (pcm.len() / channels as usize) as u64);

    Ok(PcmResponse {
        sample_rate: info.sample_rate,
        channels,
        bits_per_sample: info.bits_per_sample as u8,
        total_samples,
        pcm,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_flac_tags_metaflac,
            get_default_music_dir,
            list_flac_tracks,
            decode_flac_to_pcm
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
