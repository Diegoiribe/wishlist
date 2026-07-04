import { useEffect, useMemo, useRef, useState } from 'react';
import { hasSupabaseConfig, supabase } from './supabase';

const PEOPLE = [
  { id: 'diego', label: 'Diego' },
  { id: 'paola', label: 'Paola' }
];

const INITIAL_ITEMS = {
  diego: [],
  paola: []
};

const STORAGE_KEY = 'wishlist-couple-items';
const THEME_STORAGE_KEY = 'wishlist-couple-theme';
const THEME_SETTING_KEY = 'active_theme';

const THEMES = [
  {
    id: 'terracotta',
    page: 'from-orange-100 via-rose-50 to-stone-100',
    glow: 'bg-orange-200/45',
    rail: 'bg-orange-100',
    tabText: 'text-orange-950',
    label: 'text-orange-800',
    heading: 'text-orange-950',
    title: 'text-orange-700',
    titleAccent: 'text-orange-600',
    section: 'bg-orange-50/75',
    input: 'border-orange-200 focus:border-orange-400',
    muted: 'bg-orange-100 text-orange-900',
    primary: 'bg-orange-400 text-white',
    empty: 'border-orange-200 bg-orange-50 text-orange-800',
    link: 'text-orange-700',
    swatch: 'bg-gradient-to-br from-orange-400 via-rose-300 to-amber-200',
    popover: 'border-neutral-100'
  },
  {
    id: 'guava',
    page: 'from-pink-100 via-rose-50 to-orange-50',
    glow: 'bg-pink-200/45',
    rail: 'bg-pink-100',
    tabText: 'text-rose-950',
    label: 'text-rose-800',
    heading: 'text-rose-950',
    title: 'text-pink-600',
    titleAccent: 'text-amber-500',
    section: 'bg-rose-50/75',
    input: 'border-rose-200 focus:border-pink-400',
    muted: 'bg-rose-100 text-rose-900',
    primary: 'bg-pink-400 text-white',
    empty: 'border-rose-200 bg-rose-50 text-rose-800',
    link: 'text-pink-600',
    swatch: 'bg-gradient-to-br from-pink-400 via-rose-300 to-orange-200',
    popover: 'border-neutral-100'
  },
  {
    id: 'butter',
    page: 'from-yellow-50 via-amber-50 to-orange-50',
    glow: 'bg-amber-200/35',
    rail: 'bg-yellow-100',
    tabText: 'text-amber-950',
    label: 'text-amber-800',
    heading: 'text-amber-950',
    title: 'text-amber-600',
    titleAccent: 'text-orange-500',
    section: 'bg-yellow-50/75',
    input: 'border-yellow-200 focus:border-amber-400',
    muted: 'bg-yellow-100 text-amber-900',
    primary: 'bg-amber-400 text-white',
    empty: 'border-yellow-200 bg-yellow-50 text-amber-800',
    link: 'text-amber-600',
    swatch: 'bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-200',
    popover: 'border-neutral-100'
  },
  {
    id: 'clay',
    page: 'from-stone-100 via-orange-50 to-rose-50',
    glow: 'bg-orange-200/35',
    rail: 'bg-stone-200',
    tabText: 'text-stone-800',
    label: 'text-stone-700',
    heading: 'text-stone-900',
    title: 'text-stone-700',
    titleAccent: 'text-orange-600',
    section: 'bg-stone-100/75',
    input: 'border-stone-200 focus:border-orange-400',
    muted: 'bg-stone-200 text-stone-800',
    primary: 'bg-stone-500 text-white',
    empty: 'border-stone-200 bg-stone-100 text-stone-700',
    link: 'text-orange-700',
    swatch: 'bg-gradient-to-br from-stone-400 via-orange-300 to-rose-200',
    popover: 'border-neutral-100'
  },
  {
    id: 'cocoa',
    page: 'from-orange-50 via-stone-100 to-rose-50',
    glow: 'bg-rose-200/35',
    rail: 'bg-orange-100',
    tabText: 'text-stone-800',
    label: 'text-stone-700',
    heading: 'text-stone-900',
    title: 'text-stone-800',
    titleAccent: 'text-rose-600',
    section: 'bg-orange-50/70',
    input: 'border-orange-200 focus:border-rose-400',
    muted: 'bg-orange-100 text-stone-800',
    primary: 'bg-rose-400 text-white',
    empty: 'border-orange-200 bg-orange-50 text-stone-700',
    link: 'text-rose-600',
    swatch: 'bg-gradient-to-br from-stone-500 via-rose-300 to-orange-200',
    popover: 'border-neutral-100'
  },
  {
    id: 'peach',
    page: 'from-orange-50 via-pink-50 to-yellow-50',
    glow: 'bg-orange-200/40',
    rail: 'bg-orange-100',
    tabText: 'text-orange-900',
    label: 'text-orange-700',
    heading: 'text-orange-950',
    title: 'text-orange-600',
    titleAccent: 'text-pink-500',
    section: 'bg-orange-50/75',
    input: 'border-orange-200 focus:border-pink-400',
    muted: 'bg-orange-100 text-orange-800',
    primary: 'bg-orange-300 text-orange-950',
    empty: 'border-orange-200 bg-orange-50 text-orange-700',
    link: 'text-orange-700',
    swatch: 'bg-gradient-to-br from-orange-300 via-pink-300 to-yellow-200',
    popover: 'border-neutral-100'
  }
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function groupItemsByPerson(items) {
  return PEOPLE.reduce((groups, person) => {
    groups[person.id] = items.filter((item) => item.person === person.id);
    return groups;
  }, {});
}

function addItemToPerson(itemsByPerson, item) {
  const currentItems = itemsByPerson[item.person] ?? [];

  if (currentItems.some((currentItem) => currentItem.id === item.id)) {
    return itemsByPerson;
  }

  return {
    ...itemsByPerson,
    [item.person]: [item, ...currentItems]
  };
}

function removeItemFromPerson(itemsByPerson, item) {
  return {
    ...itemsByPerson,
    [item.person]: (itemsByPerson[item.person] ?? []).filter(
      (currentItem) => currentItem.id !== item.id
    )
  };
}

function isValidThemeId(themeId) {
  return THEMES.some((theme) => theme.id === themeId);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function UploadIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5" />
    </svg>
  );
}

function PaletteButton({ theme, onClick }) {
  return (
    <button
      type="button"
      className="flex p-1 items-center justify-center rounded-full border border-neutral-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.1)] transition hover:scale-105"
      onClick={onClick}
      aria-label="Cambiar paleta"
    >
      <span className={cx('h-6 w-6 rounded-full', theme.swatch)} />
    </button>
  );
}

function Popover({ className = '', children }) {
  return (
    <div
      className={cx(
        'absolute right-0 top-[calc(100%+12px)] z-30 rounded-[24px] border border-neutral-100 bg-white p-1 shadow-[0_22px_55px_rgba(15,23,42,0.14)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(PEOPLE[0].id);
  const [itemsByPerson, setItemsByPerson] = useState(INITIAL_ITEMS);
  const [activeThemeId, setActiveThemeId] = useState(() => {
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    const savedTheme = THEMES.find((theme) => theme.id === savedThemeId);
    return savedTheme?.id ?? THEMES[1].id;
  });
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    link: '',
    image: ''
  });
  const [syncError, setSyncError] = useState('');
  const paletteRef = useRef(null);
  const addRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (hasSupabaseConfig) {
        const [{ data: items, error: itemsError }, { data: setting }] =
          await Promise.all([
            supabase
              .from('wishlist_items')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('wishlist_settings')
              .select('value')
              .eq('key', THEME_SETTING_KEY)
              .maybeSingle()
          ]);

        if (itemsError) {
          console.error('Supabase items load error:', itemsError);
          setSyncError(`No se pudo cargar Supabase: ${itemsError.message}`);
        }

        if (!itemsError && items) {
          setItemsByPerson(groupItemsByPerson(items));
        }

        if (isValidThemeId(setting?.value)) {
          setActiveThemeId(setting.value);
        }

        return;
      }

      const savedItems = localStorage.getItem(STORAGE_KEY);
      if (!savedItems) return;

      try {
        const parsedItems = JSON.parse(savedItems);
        setItemsByPerson({
          diego: Array.isArray(parsedItems.diego) ? parsedItems.diego : [],
          paola: Array.isArray(parsedItems.paola) ? parsedItems.paola : []
        });
      } catch {
        setItemsByPerson(INITIAL_ITEMS);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;

    const channel = supabase
      .channel('wishlist-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishlist_items' },
        ({ new: newItem }) => {
          setItemsByPerson((current) => addItemToPerson(current, newItem));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'wishlist_items' },
        ({ old: oldItem }) => {
          setItemsByPerson((current) => removeItemFromPerson(current, oldItem));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_settings',
          filter: `key=eq.${THEME_SETTING_KEY}`
        },
        ({ new: newSetting }) => {
          if (isValidThemeId(newSetting?.value)) {
            setActiveThemeId(newSetting.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    function closePopovers(event) {
      if (paletteRef.current?.contains(event.target)) return;
      if (addRef.current?.contains(event.target)) return;
      setIsPaletteOpen(false);
      setIsAddOpen(false);
    }

    document.addEventListener('mousedown', closePopovers);
    return () => document.removeEventListener('mousedown', closePopovers);
  }, []);

  useEffect(() => {
    if (hasSupabaseConfig) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsByPerson));
  }, [itemsByPerson]);

  useEffect(() => {
    if (hasSupabaseConfig) return;
    localStorage.setItem(THEME_STORAGE_KEY, activeThemeId);
  }, [activeThemeId]);

  async function handleThemeChange(themeId) {
    setActiveThemeId(themeId);
    setIsPaletteOpen(false);

    if (!hasSupabaseConfig) {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      return;
    }

    const { error } = await supabase.from('wishlist_settings').upsert({
      key: THEME_SETTING_KEY,
      value: themeId,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Supabase theme save error:', error);
      setSyncError(`No se pudo guardar la paleta: ${error.message}`);
    } else {
      setSyncError('');
    }
  }

  const activeItems = useMemo(
    () => itemsByPerson[activeTab] ?? [],
    [activeTab, itemsByPerson]
  );

  const activeTheme =
    THEMES.find((theme) => theme.id === activeThemeId) ?? THEMES[1];

  const activePerson = PEOPLE.find((person) => person.id === activeTab);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const image = await compressImage(file);
    setFormValues((current) => ({ ...current, image }));
  }

  function resetForm() {
    setFormValues({ name: '', link: '', image: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSyncError('');

    if (
      !formValues.name.trim() ||
      !formValues.link.trim() ||
      !formValues.image
    ) {
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      person: activeTab,
      name: formValues.name.trim(),
      link: formValues.link.trim(),
      image: formValues.image
    };

    if (hasSupabaseConfig) {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          person: activeTab,
          name: newItem.name,
          link: newItem.link,
          image: newItem.image
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        setSyncError(`No se pudo guardar: ${error.message}`);
        return;
      }

      if (!error && data) {
        setItemsByPerson((current) => addItemToPerson(current, data));
      }
    } else {
      setItemsByPerson((current) => addItemToPerson(current, newItem));
    }

    resetForm();
    setIsAddOpen(false);
  }

  async function handleDelete(item) {
    setItemsByPerson((current) => removeItemFromPerson(current, item));

    if (hasSupabaseConfig) {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error('Supabase delete error:', error);
        setSyncError(`No se pudo eliminar: ${error.message}`);
        setItemsByPerson((current) => addItemToPerson(current, item));
      }
    }
  }

  return (
    <main
      className={cx(
        'relative min-h-screen overflow-hidden bg-gradient-to-br px-4 py-8 font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Display","Helvetica_Neue",Arial,sans-serif] text-slate-800',
        activeTheme.page
      )}
    >
      <div
        className={cx(
          'pointer-events-none absolute left-1/2 top-0 h-72 w-[72rem] -translate-x-1/2 blur-3xl',
          activeTheme.glow
        )}
      />

      <section
        className={cx(
          'relative mx-auto w-full max-w-[1100px] rounded-[28px] border border-white/70 p-5 shadow-[0_20px_45px_rgba(96,62,20,0.12)] md:p-7',
          activeTheme.section
        )}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className={cx('inline-flex rounded-full p-1', activeTheme.rail)}>
            {PEOPLE.map((person) => {
              const isActive = person.id === activeTab;

              return (
                <button
                  key={person.id}
                  type="button"
                  className={cx(
                    'rounded-full px-6 py-3 text-base transition',
                    isActive
                      ? 'bg-white text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.08)]'
                      : activeTheme.tabText
                  )}
                  onClick={() => setActiveTab(person.id)}
                >
                  {person.label}
                </button>
              );
            })}
          </div>

          <div className="relative" ref={paletteRef}>
            <PaletteButton
              theme={activeTheme}
              onClick={() => setIsPaletteOpen((current) => !current)}
            />

            {isPaletteOpen && (
              <Popover className={cx('w-auto', activeTheme.popover)}>
                <div className="flex gap-1">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={cx(
                        'flex h-8 w-8 items-center justify-center rounded-full bg-white transition hover:scale-105',
                        activeThemeId === theme.id &&
                          'shadow-[inset_0_0_0_2px_rgba(15,23,42,0.08)]'
                      )}
                      onClick={() => {
                        handleThemeChange(theme.id);
                      }}
                      aria-label={`Usar paleta ${theme.id}`}
                    >
                      <span
                        className={cx('h-7 w-7 rounded-full', theme.swatch)}
                      />
                    </button>
                  ))}
                </div>
              </Popover>
            )}
          </div>
        </div>

        <h1
          className={cx(
            'mb-7 font-["Playfair_Display",serif] text-6xl font-semibold italic leading-none tracking-normal md:text-8xl',
            activeTheme.title
          )}
        >
          Wishlist
        </h1>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className={cx('m-0 text-base', activeTheme.label)}>
              Wishlist de {activePerson?.label}
            </p>
            <h2
              className={cx(
                'mt-1 inline-grid grid-cols-[0.42em_1.1em_0.42em] items-center text-center text-4xl font-bold leading-none',
                activeTheme.title
              )}
            >
              <span className="justify-self-start">[</span>
              <span className="justify-self-center tabular-nums">
                {activeItems.length}
              </span>
              <span className="justify-self-end">]</span>
            </h2>
          </div>

          <div className="relative" ref={addRef}>
            <button
              type="button"
              className={cx(
                'grid h-12 w-12 place-items-center rounded-full pb-1 text-3xl leading-none shadow-[0_12px_26px_rgba(15,23,42,0.14)] transition hover:scale-105',
                activeTheme.primary
              )}
              onClick={() => setIsAddOpen((current) => !current)}
              aria-label="Agregar producto"
            >
              +
            </button>

            {isAddOpen && (
              <Popover className={cx('w-[360px]', activeTheme.popover)}>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <label
                    className={cx(
                      'grid min-h-[180px] place-items-center rounded-[20px] border border-dashed bg-white/70 p-4 text-center transition',
                      activeTheme.input
                    )}
                  >
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    {formValues.image ? (
                      <img
                        src={formValues.image}
                        alt="Vista previa"
                        className="h-full max-h-[160px] w-full rounded-[16px] object-cover"
                      />
                    ) : (
                      <span
                        className={cx(
                          'grid gap-2 place-items-center',
                          activeTheme.label
                        )}
                      >
                        <UploadIcon />
                        <span className="text-sm font-medium">
                          Subir imagen
                        </span>
                        <span className="text-xs opacity-70">
                          Ejemplo del producto
                        </span>
                      </span>
                    )}
                  </label>

                  <input
                    className={cx(
                      'rounded-[16px] border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400',
                      activeTheme.input
                    )}
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    placeholder="Nombre del producto"
                  />

                  <input
                    className={cx(
                      'rounded-[16px] border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400',
                      activeTheme.input
                    )}
                    type="url"
                    name="link"
                    value={formValues.link}
                    onChange={handleChange}
                    placeholder="Link"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cx(
                        'rounded-full px-4 py-2 text-sm font-medium',
                        activeTheme.muted
                      )}
                      onClick={() => {
                        resetForm();
                        setIsAddOpen(false);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={cx(
                        'rounded-full px-4 py-2 text-sm font-medium',
                        activeTheme.primary
                      )}
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </Popover>
            )}
          </div>
        </div>

        {syncError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {syncError}
          </div>
        )}

        {activeItems.length === 0 ? (
          <div
            className={cx(
              'rounded-[24px] border border-dashed px-6 py-10 text-center',
              activeTheme.empty
            )}
          >
            <p className="m-0">Todavia no hay productos aqui.</p>
            <span>Usa + para subir el primero.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {activeItems.map((item, index) => (
              <article
                key={item.id}
                className="group relative bg-white p-2 pb-5 shadow-[0_16px_32px_rgba(71,46,18,0.12)] transition hover:z-10 hover:scale-[1.02]"
                style={{
                  transform: `rotate(${[-1.8, 1.2, -0.7, 1.7][index % 4]}deg)`
                }}
              >
                <button
                  type="button"
                  className="absolute right-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-lg leading-none text-stone-600 opacity-90 shadow-[0_6px_18px_rgba(15,23,42,0.14)] transition hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(item)}
                  aria-label="Quitar producto"
                >
                  ×
                </button>
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-square w-full bg-stone-100 object-cover"
                />
                <div className="px-2 pt-3">
                  <h3
                    className={cx(
                      'mb-1 mt-0 truncate text-base font-semibold',
                      activeTheme.heading
                    )}
                  >
                    {item.name}
                  </h3>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className={cx('text-sm no-underline', activeTheme.link)}
                  >
                    Ver producto
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
