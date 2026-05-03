import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <Smoke />;
}

function Smoke() {
  const t = useTranslations('scaffold');
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-xl">
        <h1 className="text-4xl font-bold">{t('headline')}</h1>
        <p className="text-lg text-neutral-600">{t('subline')}</p>
        <p className="text-sm text-neutral-500">
          <Link href="/" locale="en">English</Link>
          {' · '}
          <Link href="/" locale="es">Español</Link>
        </p>
      </div>
    </main>
  );
}
