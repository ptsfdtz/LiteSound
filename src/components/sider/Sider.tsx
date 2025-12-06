import styles from './Sider.module.css';

type SiderProps = {
  playlists: string[];
  activePlaylist: string;
  onPlaylistSelect: (playlist: string) => void;
};

function Sider({ playlists, activePlaylist, onPlaylistSelect }: SiderProps) {
  return (
    <div className={styles.sider}>
      <div className={styles.logo}>lite player</div>
      <div className={styles.playlists}>
        <div className={styles.sectionTitle}>Playlists</div>
        <ul className={styles.list}>
          {playlists.map((item) => (
            <li
              key={item}
              className={`${styles.listItem} ${activePlaylist === item ? styles.active : ''}`}
              onClick={() => onPlaylistSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.storage}>
        <div className={styles.sectionTitle}>Library</div>
        <div className={styles.hint}>Add folders via Tauri menu</div>
      </div>
    </div>
  );
}

export default Sider;
