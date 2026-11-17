import type { SlotFormProps } from '../formRegistry.js';
import type { Publication } from '@cv/core';
import { useTranslation } from 'react-i18next';
import { authorshipSchema } from '@cv/core';
import { Field } from '../../../ui/Field.js';
import { ListFormHeader } from '../../../ui/ListFormHeader.js';
import { ListItemCard } from '../../../ui/ListItemCard.js';
import { RichTextField } from '../../../ui/RichTextField.js';
import { Select } from '../../../ui/Select.js';
import { SortableList } from '../../../ui/SortableList.js';
import { ToggleGroup } from '../../../ui/ToggleGroup.js';
import { generateId } from '../../../utils/generateId.js';
import { SECTION_BY_ID } from '../sectionConfig.js';
import { useListSection } from '../useListSection.js';
import { useSlotComponentOption } from '../useSlotComponentOption.js';

const AUTHORSHIP_DISPLAYS = ['inline', 'marker'] as const;

function emptyPublication(): Publication {
  return {
    id: generateId('pub'),
    name: '',
    publisher: '',
    releaseDate: '',
  };
}

const sectionDef = SECTION_BY_ID.get('publications');
const summarize = sectionDef?.summarize ?? (() => '');

export function PublicationsForm({ slotName, componentId }: SlotFormProps) {
  const { t } = useTranslation();
  const { items, add, remove, patch, reorder } = useListSection<Publication>(
    'publications',
    emptyPublication,
  );
  const [authorshipDisplay, setAuthorshipDisplay] = useSlotComponentOption(
    slotName,
    componentId,
    'authorshipDisplay',
    'inline',
  );

  const authorshipDisplayOptions = AUTHORSHIP_DISPLAYS.map((d) => ({
    value: d,
    label: t(`publications.authorshipDisplay_${d}`),
  }));
  const authorshipOptions = [
    { value: '', label: t('publications.authorship_none') },
    ...authorshipSchema.options.map((a) => ({
      value: a,
      label: t(`publications.authorship_${a}`),
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <ListFormHeader count={items.length} onAdd={add} />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">{t('publications.authorship')}</span>
        <ToggleGroup
          options={authorshipDisplayOptions}
          value={authorshipDisplay}
          onChange={setAuthorshipDisplay}
        />
      </div>

      <SortableList items={items} onReorder={reorder} className="flex flex-col">
        {(p) => (
          <ListItemCard
            key={p.id}
            id={p.id}
            summary={summarize(p as unknown as Record<string, unknown>, t)}
            defaultOpen={!p.name}
            onRemove={() => {
              remove(p.id);
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label={t('publications.name')}
                  value={p.name}
                  onChange={(e) => {
                    patch(p.id, { name: e.target.value });
                  }}
                />
                <Field
                  label={t('publications.publisher')}
                  value={p.publisher ?? ''}
                  onChange={(e) => {
                    patch(p.id, { publisher: e.target.value });
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label={t('publications.releaseDate')}
                  placeholder="YYYY-MM"
                  value={p.releaseDate ?? ''}
                  onChange={(e) => {
                    patch(p.id, { releaseDate: e.target.value });
                  }}
                />
                <Field
                  label={t('publications.url')}
                  type="url"
                  value={p.url ?? ''}
                  onChange={(e) => {
                    patch(p.id, { url: e.target.value });
                  }}
                />
              </div>
              <Select
                label={t('publications.authorship')}
                value={p.authorship ?? ''}
                onChange={(e) => {
                  const parsed = authorshipSchema.safeParse(e.target.value);
                  patch(p.id, { authorship: parsed.success ? parsed.data : undefined });
                }}
                options={authorshipOptions}
              />
              <RichTextField
                label={t('publications.summary')}
                value={p.summary ?? ''}
                onChange={(html) => {
                  patch(p.id, { summary: html });
                }}
              />
            </div>
          </ListItemCard>
        )}
      </SortableList>
    </div>
  );
}
