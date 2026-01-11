import styles from '@/components/FiltersBar/FiltersBar.module.css';
import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { useI18n } from '@/locales';

type FiltersBarProps = {
  composers: string[];
  composerFilter: string;
  onComposerChange: (value: string) => void;
  albums: string[];
  albumFilter: string;
  onAlbumChange: (value: string) => void;
};

export function FiltersBar(props: FiltersBarProps) {
  const { composers, composerFilter, onComposerChange, albums, albumFilter, onAlbumChange } = props;
  const { t } = useI18n();

  const renderFilterLabel = (value: string) => {
    if (value === 'All') return t('filters.all');
    if (value === 'Unknown') return t('filters.unknown');
    return value;
  };

  return (
    <div className={styles.filters}>
      <div className={styles.item}>
        <Dropdown
          value={composerFilter}
          onChange={onComposerChange}
          options={composers}
          getOptionLabel={renderFilterLabel}
          buttonLabel={`${t('filters.composer')}: ${renderFilterLabel(composerFilter)}`}
          selectedLabel={t('filters.selected')}
        />
      </div>
      <div className={styles.item}>
        <Dropdown
          value={albumFilter}
          onChange={onAlbumChange}
          options={albums}
          getOptionLabel={renderFilterLabel}
          buttonLabel={`${t('filters.album')}: ${renderFilterLabel(albumFilter)}`}
          selectedLabel={t('filters.selected')}
        />
      </div>
    </div>
  );
}
