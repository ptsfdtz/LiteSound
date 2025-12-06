import SelectField from '../common/select/SelectField';
import styles from './FilterBar.module.css';

type FilterBarProps = {
  artistFilter: string;
  albumFilter: string;
  onArtistChange: (value: string) => void;
  onAlbumChange: (value: string) => void;
  artists: string[];
  albums: string[];
};

function FilterBar({ artistFilter, albumFilter, onArtistChange, onAlbumChange, artists, albums }: FilterBarProps) {
  const artistOptions = [
    { label: 'All artists', value: 'all' },
    ...artists.map((artist) => ({ label: artist, value: artist })),
  ];

  const albumOptions = [
    { label: 'All albums', value: 'all' },
    ...albums.map((album) => ({ label: album, value: album })),
  ];

  return (
    <div className={styles.filterBar} data-tauri-drag-region="false">
      <SelectField
        id="artist-select"
        label="Artist"
        options={artistOptions}
        value={artistFilter}
        onChange={onArtistChange}
      />
      <SelectField
        id="album-select"
        label="Album"
        options={albumOptions}
        value={albumFilter}
        onChange={onAlbumChange}
      />
    </div>
  );
}

export default FilterBar;
