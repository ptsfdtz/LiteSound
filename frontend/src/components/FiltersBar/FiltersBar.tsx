import { Dropdown } from '@/components/common/Dropdown/Dropdown';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/locales';

type FiltersBarProps = {
  composers: string[];
  composerFilter: string;
  onComposerChange: (value: string) => void;
  albums: string[];
  albumFilter: string;
  onAlbumChange: (value: string) => void;
  trackQuery: string;
  onTrackQueryChange: (value: string) => void;
};

export function FiltersBar(props: FiltersBarProps) {
  const {
    composers,
    composerFilter,
    onComposerChange,
    albums,
    albumFilter,
    onAlbumChange,
    trackQuery,
    onTrackQueryChange,
  } = props;
  const { t } = useI18n();

  const renderFilterLabel = (value: string) => {
    if (value === 'All') return t('filters.all');
    if (value === 'Unknown') return t('filters.unknown');
    return value;
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex items-center gap-2">
        <Dropdown
          value={composerFilter}
          onChange={onComposerChange}
          options={composers}
          getOptionLabel={renderFilterLabel}
          getOptionKey={(value) => value}
          buttonLabel={`${t('filters.composer')}: ${renderFilterLabel(composerFilter)}`}
          selectedLabel={t('filters.selected')}
          className="w-[240px]"
        />
      </div>
      <div className="relative flex items-center gap-2">
        <Dropdown
          value={albumFilter}
          onChange={onAlbumChange}
          options={albums}
          getOptionLabel={renderFilterLabel}
          getOptionKey={(value) => value}
          buttonLabel={`${t('filters.album')}: ${renderFilterLabel(albumFilter)}`}
          selectedLabel={t('filters.selected')}
          className="w-[240px]"
        />
      </div>
      <Input
        className="w-[320px]"
        placeholder={t('filters.trackInputPlaceholder')}
        value={trackQuery}
        onChange={(event) => onTrackQueryChange(event.target.value)}
      />
    </div>
  );
}
