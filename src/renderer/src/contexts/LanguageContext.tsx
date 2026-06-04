import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type SupportedLanguage = 'en' | 'es' | 'pt'
export type TranslationValues = Record<string, string | number>

type TranslationCatalog = typeof en
export type TranslationKey = keyof TranslationCatalog

type LanguageContextValue = {
  language: SupportedLanguage
  t: (key: TranslationKey, values?: TranslationValues) => string
}

const en = {
  'app.loadingEyebrow': 'Loading',
  'app.loadingTitle': 'Preparing view',
  'app.navAriaLabel': 'Primary',
  'app.downloadActionsAriaLabel': 'Download actions',
  'app.windowControlsAriaLabel': 'Window controls',
  'app.openDownloadsFolder': 'Open downloads folder',
  'app.minimize': 'Minimize',
  'app.maximize': 'Maximize',
  'app.restore': 'Restore',
  'app.close': 'Close',
  'nav.home': 'Home',
  'nav.playlist': 'Playlist',
  'nav.youtube': 'YouTube',
  'nav.downloads': 'Downloads',
  'nav.settings': 'Settings',

  'home.eyebrow': 'Home',
  'home.title': 'Download a video',

  'downloads.eyebrow': 'Downloads',
  'downloads.title': 'Download details',
  'downloads.empty': 'No downloads in this session.',
  'downloads.channel': 'Channel',
  'downloads.duration': 'Duration',
  'downloads.year': 'Year',
  'downloads.showInFolder': 'Show in folder',

  'playlist.eyebrow': 'Playlist',
  'playlist.title': 'Explore a playlist',
  'playlist.panelTitle': 'YouTube playlist',
  'playlist.urlLabel': 'Playlist URL',
  'playlist.urlPlaceholder': 'https://www.youtube.com/playlist?list=PLxxxxxxx',
  'playlist.fetchLoading': 'Fetching list...',
  'playlist.fetch': 'Fetch list',
  'playlist.longWarningTitle': 'The list is too long.',
  'playlist.longWarningCopy': 'It may make the app unstable. This playlist has {count} videos.',
  'playlist.loadAnyway': 'Load anyway',
  'playlist.loadFirst100': 'Load only the first 100',
  'playlist.videoCountOne': '1 video',
  'playlist.videoCountMany': '{count} videos',
  'playlist.queueTitle': 'Playlist queue',
  'playlist.queueEmpty': 'Remove videos or load a playlist to fill the queue.',
  'playlist.downloadLabel': 'Download playlist',
  'playlist.errorMissingUrl': 'Paste a YouTube playlist URL.',
  'playlist.errorInvalidUrl': 'The URL must be a YouTube playlist (with ?list=...).',
  'playlist.errorEmpty': 'The playlist is empty or no videos were found.',

  'settings.eyebrow': 'Settings',
  'settings.title': 'Download preferences',
  'settings.quickReady': 'Quick download configured.',
  'settings.quickNeedsConfig': 'Configure folder, format, and quality to enable quick download.',
  'settings.directoryLabel': 'Downloads directory',
  'settings.chooseFolder': 'Choose folder',
  'settings.defaultFormat': 'Default format',
  'settings.defaultQuality': 'Default quality',
  'settings.mp4Option': 'MP4 compatible',
  'settings.mp3Option': 'MP3 audio',
  'settings.autoOption': 'Auto',
  'settings.confirmQuickDownload': 'Confirm quick download',

  'youtube.hideSideList': 'Hide side list',
  'youtube.showSideList': 'Show side list',
  'youtube.hideList': 'Hide list',
  'youtube.showList': 'Show list',
  'youtube.duplicateToast': 'This video was already in the list',
  'youtube.addedToast': 'Video added to the list',
  'youtube.clickedTitle': 'Clicked videos',
  'youtube.clickedEmpty': 'Open YouTube inside the app and enter videos to add them to this list.',
  'youtube.clickedDownloadLabel': 'Download',
  'youtube.loading': 'Loading YouTube...',
  'youtube.use': 'Use',
  'youtube.quick': 'Quick',
  'youtube.rightClickEmpty': 'Right-click a video to add it.',

  'downloadForm.urlLabel': 'YouTube URL',
  'downloadForm.urlPlaceholder': 'https://www.youtube.com/watch?v=...',
  'downloadForm.quickDownload': 'Quick download',
  'downloadForm.quickReadyHelp': 'Uses the shared folder, format, and quality without preview.',
  'downloadForm.quickNeedsConfigHelp': 'Configure folder, format, and quality to enable it.',
  'downloadForm.format': 'Format',
  'downloadForm.quality': 'Quality',
  'downloadForm.downloadFolder': 'Download folder',
  'downloadForm.loadingPreview': 'Loading preview...',
  'downloadForm.downloading': 'Downloading...',
  'downloadForm.downloadFormat': 'Download {format}',
  'downloadForm.viewPreview': 'View preview',

  'metadata.eyebrow': 'Metadata preview',
  'metadata.artist': 'Artist',
  'metadata.year': 'Year',
  'metadata.duration': 'Duration',
  'metadata.authorUrl': 'Author URL',
  'metadata.unavailable': 'Unavailable',

  'status.showInFolder': 'Show in folder',
  'status.version': 'Version {version}',
  'status.stepPreparingDownload': 'Preparing download',
  'status.stepDownloadingFile': 'Downloading file',
  'status.stepDownloadingCover': 'Downloading cover',
  'status.stepConverting': 'Converting',
  'status.stepMerging': 'Merging file',
  'status.stepCompleted': 'Completed',
  'status.stepFailed': 'Error',
  'status.timelinePreparing': 'Preparing',
  'status.timelineFile': 'File',
  'status.timelineConvert': 'Convert',
  'status.timelineComplete': 'Complete',
  'status.timelineCover': 'Cover',
  'status.timelineMerge': 'Merge',
  'status.timelineError': 'Error',
  'status.idle': 'Waiting',
  'status.queued': 'Queued',
  'status.starting': 'Preparing',
  'status.downloading': 'Downloading',
  'status.processing': 'Processing',
  'status.completed': 'Completed',
  'status.failed': 'Error',
  'status.eta': 'ETA {eta}',
  'status.calculatingProgress': 'Calculating progress...',
  'status.approximateProgress': 'Approximate progress',
  'status.queuedStep': 'Waiting for turn',
  'status.readyStep': 'Ready to download',
  'status.progressAriaLabel': 'Download progress',
  'status.waitingProgress': 'Waiting for progress...',
  'status.readyMessage': 'Ready to download.',
  'status.loadingPreviewMessage': 'Loading metadata preview...',
  'status.previewFailedMessage': 'Could not load the preview.',
  'status.previewReadyMessage': 'Preview ready. Review the details and download.',
  'status.urlChangedMessage': 'The URL changed. Loading a new preview...',
  'status.batchActiveMessage': 'A list is downloading. Wait for it to finish.',
  'status.downloadActiveMessage': 'There is already an active download. Wait for it to finish.',
  'status.preparingDownloadMessage': 'Preparing download...',
  'status.downloadedAt': 'Downloaded to {path}',
  'status.downloadCompletedMessage': 'Download completed.',
  'status.quickNeedsConfigMessage': 'Configure folder, format, and quality in Settings before using quick download.',
  'status.missingYouTubeUrlMessage': 'Paste a YouTube URL first.',
  'status.invalidYouTubeUrlMessage': 'The URL must be from youtube.com or youtu.be.',
  'status.batchNeedsConfigMessage': 'Configure folder, format, and quality in Settings before downloading lists.',
  'status.noVideosMessage': 'There are no videos to download.',
  'status.batchSourcePlaylist': 'playlist',
  'status.batchSourceYouTube': 'clicked videos',
  'status.batchStarting': 'Downloading {count} videos from {source} in groups of {batchSize}...',
  'status.batchProgress': 'List: {completed} completed, {failed} failed, {pending} pending.',
  'status.batchFinishedWithFailures': 'List download finished with {completed} completed and {failed} failed.',
  'status.batchCompleted': 'List download completed: {completed} videos.',
  'status.queuedMessage': 'Queued.',

  'queue.downloading': 'Downloading...',
  'queue.quickDownloadAria': 'Quick download',
  'queue.quickDownloadTooltip': 'Quick download',
  'queue.removeVideoAria': 'Remove video',
  'queue.removeTooltip': 'Remove',

  'hero.eyebrow': 'WhoDownloads',
  'hero.title': 'Download YouTube as MP4 or MP3',
  'hero.copy': 'Paste a public YouTube URL. Download compatible MP4 video or MP3 audio to Downloads/WhoDownloads.'
} as const

const es: Partial<TranslationCatalog> = {
  'app.loadingEyebrow': 'Cargando',
  'app.loadingTitle': 'Preparando vista',
  'app.navAriaLabel': 'Principal',
  'app.downloadActionsAriaLabel': 'Acciones de descargas',
  'app.windowControlsAriaLabel': 'Controles de ventana',
  'app.openDownloadsFolder': 'Abrir carpeta de descargas',
  'app.minimize': 'Minimizar',
  'app.maximize': 'Maximizar',
  'app.restore': 'Restaurar',
  'app.close': 'Cerrar',
  'nav.home': 'Inicio',
  'nav.playlist': 'Playlist',
  'nav.youtube': 'YouTube',
  'nav.downloads': 'Descargas',
  'nav.settings': 'Configuración',

  'home.eyebrow': 'Inicio',
  'home.title': 'Descarga un video',

  'downloads.eyebrow': 'Descargas',
  'downloads.title': 'Detalles de descarga',
  'downloads.empty': 'No hay descargas en esta sesión.',
  'downloads.channel': 'Canal',
  'downloads.duration': 'Duración',
  'downloads.year': 'Año',
  'downloads.showInFolder': 'Mostrar en carpeta',

  'playlist.eyebrow': 'Playlist',
  'playlist.title': 'Explora una playlist',
  'playlist.panelTitle': 'Playlist de YouTube',
  'playlist.urlLabel': 'URL de playlist',
  'playlist.fetchLoading': 'Obteniendo lista...',
  'playlist.fetch': 'Obtener lista',
  'playlist.longWarningTitle': 'La lista es demasiado larga.',
  'playlist.longWarningCopy': 'Puede causar inestabilidades en la app. Esta playlist tiene {count} videos.',
  'playlist.loadAnyway': 'Cargar de todas formas',
  'playlist.loadFirst100': 'Cargar solo los primeros 100',
  'playlist.videoCountOne': '1 video',
  'playlist.videoCountMany': '{count} videos',
  'playlist.queueTitle': 'Cola de playlist',
  'playlist.queueEmpty': 'Quita videos o carga una playlist para llenar la cola.',
  'playlist.downloadLabel': 'Descargar playlist',
  'playlist.errorMissingUrl': 'Pega una URL de playlist de YouTube.',
  'playlist.errorInvalidUrl': 'La URL debe ser una playlist de YouTube (con ?list=...).',
  'playlist.errorEmpty': 'La playlist está vacía o no se encontraron videos.',

  'settings.eyebrow': 'Configuración',
  'settings.title': 'Preferencias de descarga',
  'settings.quickReady': 'Descarga rápida configurada.',
  'settings.quickNeedsConfig': 'Configura carpeta, formato y calidad para habilitar descarga rápida.',
  'settings.directoryLabel': 'Directorio de descargas',
  'settings.chooseFolder': 'Elegir carpeta',
  'settings.defaultFormat': 'Formato por defecto',
  'settings.defaultQuality': 'Calidad por defecto',
  'settings.mp4Option': 'MP4 compatible',
  'settings.mp3Option': 'MP3 audio',
  'settings.confirmQuickDownload': 'Confirmar descarga rápida',

  'youtube.hideSideList': 'Ocultar lista lateral',
  'youtube.showSideList': 'Mostrar lista lateral',
  'youtube.hideList': 'Ocultar lista',
  'youtube.showList': 'Mostrar lista',
  'youtube.duplicateToast': 'Este video ya estaba en la lista',
  'youtube.addedToast': 'Video agregado a la lista',
  'youtube.clickedTitle': 'Videos clickeados',
  'youtube.clickedEmpty': 'Abre YouTube dentro de la app y entra a videos para agregarlos a esta lista.',
  'youtube.clickedDownloadLabel': 'Descargar',
  'youtube.loading': 'Cargando YouTube...',
  'youtube.use': 'Usar',
  'youtube.quick': 'Rápida',
  'youtube.rightClickEmpty': 'Click derecho sobre un video para agregarlo.',

  'downloadForm.urlLabel': 'URL de YouTube',
  'downloadForm.quickDownload': 'Descarga rápida',
  'downloadForm.quickReadyHelp': 'Usa la carpeta, formato y calidad compartidos, sin preview.',
  'downloadForm.quickNeedsConfigHelp': 'Configura carpeta, formato y calidad para habilitarla.',
  'downloadForm.format': 'Formato',
  'downloadForm.quality': 'Calidad',
  'downloadForm.downloadFolder': 'Carpeta de descarga',
  'downloadForm.loadingPreview': 'Cargando preview...',
  'downloadForm.downloading': 'Descargando...',
  'downloadForm.downloadFormat': 'Descargar {format}',
  'downloadForm.viewPreview': 'Ver preview',

  'metadata.eyebrow': 'Preview de metadata',
  'metadata.artist': 'Artista',
  'metadata.year': 'Año',
  'metadata.duration': 'Duración',
  'metadata.authorUrl': 'URL del autor',
  'metadata.unavailable': 'No disponible',

  'status.showInFolder': 'Mostrar en carpeta',
  'status.version': 'Versión {version}',
  'status.stepPreparingDownload': 'Preparando descarga',
  'status.stepDownloadingFile': 'Descargando archivo',
  'status.stepDownloadingCover': 'Descargando cover',
  'status.stepConverting': 'Convirtiendo',
  'status.stepMerging': 'Unificando archivo',
  'status.stepCompleted': 'Completado',
  'status.stepFailed': 'Error',
  'status.timelinePreparing': 'Preparando',
  'status.timelineFile': 'Archivo',
  'status.timelineConvert': 'Convertir',
  'status.timelineComplete': 'Completo',
  'status.timelineMerge': 'Unificar',
  'status.idle': 'En espera',
  'status.queued': 'En cola',
  'status.starting': 'Preparando',
  'status.downloading': 'Descargando',
  'status.processing': 'Procesando',
  'status.completed': 'Completado',
  'status.failed': 'Error',
  'status.eta': 'ETA {eta}',
  'status.calculatingProgress': 'Calculando progreso...',
  'status.approximateProgress': 'Progreso aproximado',
  'status.queuedStep': 'Esperando turno',
  'status.readyStep': 'Listo para descargar',
  'status.progressAriaLabel': 'Progreso de descarga',
  'status.waitingProgress': 'Esperando progreso...',
  'status.readyMessage': 'Listo para descargar.',
  'status.loadingPreviewMessage': 'Cargando preview de metadata...',
  'status.previewFailedMessage': 'No se pudo cargar la preview.',
  'status.previewReadyMessage': 'Preview lista. Revisa los datos y descarga.',
  'status.urlChangedMessage': 'La URL cambió. Cargando nueva preview...',
  'status.batchActiveMessage': 'Hay una lista descargándose. Espera a que termine.',
  'status.downloadActiveMessage': 'Ya hay una descarga activa. Espera a que termine.',
  'status.preparingDownloadMessage': 'Preparando descarga...',
  'status.downloadedAt': 'Descargado en {path}',
  'status.downloadCompletedMessage': 'Descarga completada.',
  'status.quickNeedsConfigMessage': 'Configura carpeta, formato y calidad en Configuración antes de usar descarga rápida.',
  'status.missingYouTubeUrlMessage': 'Pega una URL de YouTube primero.',
  'status.invalidYouTubeUrlMessage': 'La URL debe ser de youtube.com o youtu.be.',
  'status.batchNeedsConfigMessage': 'Configura carpeta, formato y calidad en Configuración antes de descargar listas.',
  'status.noVideosMessage': 'No hay videos para descargar.',
  'status.batchSourcePlaylist': 'playlist',
  'status.batchSourceYouTube': 'videos clickeados',
  'status.batchStarting': 'Descargando {count} videos de {source} en grupos de {batchSize}...',
  'status.batchProgress': 'Lista: {completed} completadas, {failed} fallidas, {pending} pendientes.',
  'status.batchFinishedWithFailures': 'Descarga de lista terminada con {completed} completadas y {failed} fallidas.',
  'status.batchCompleted': 'Descarga de lista completada: {completed} videos.',
  'status.queuedMessage': 'En cola.',

  'queue.downloading': 'Descargando...',
  'queue.quickDownloadAria': 'Descargar rápido',
  'queue.quickDownloadTooltip': 'Descarga rápida',
  'queue.removeVideoAria': 'Quitar video',
  'queue.removeTooltip': 'Quitar',

  'hero.title': 'Descarga YouTube en MP4 o MP3',
  'hero.copy': 'Pega una URL pública de YouTube. Descarga video MP4 compatible o audio MP3 en Downloads/WhoDownloads.'
}

const pt: Partial<TranslationCatalog> = {
  'app.loadingEyebrow': 'Carregando',
  'app.loadingTitle': 'Preparando visualização',
  'app.navAriaLabel': 'Principal',
  'app.downloadActionsAriaLabel': 'Ações de download',
  'app.windowControlsAriaLabel': 'Controles da janela',
  'app.openDownloadsFolder': 'Abrir pasta de downloads',
  'app.minimize': 'Minimizar',
  'app.maximize': 'Maximizar',
  'app.restore': 'Restaurar',
  'app.close': 'Fechar',
  'nav.home': 'Início',
  'nav.playlist': 'Playlist',
  'nav.youtube': 'YouTube',
  'nav.downloads': 'Downloads',
  'nav.settings': 'Configurações',

  'home.eyebrow': 'Início',
  'home.title': 'Baixe um vídeo',

  'downloads.eyebrow': 'Downloads',
  'downloads.title': 'Detalhes do download',
  'downloads.empty': 'Não há downloads nesta sessão.',
  'downloads.channel': 'Canal',
  'downloads.duration': 'Duração',
  'downloads.year': 'Ano',
  'downloads.showInFolder': 'Mostrar na pasta',

  'playlist.eyebrow': 'Playlist',
  'playlist.title': 'Explore uma playlist',
  'playlist.panelTitle': 'Playlist do YouTube',
  'playlist.urlLabel': 'URL da playlist',
  'playlist.fetchLoading': 'Buscando lista...',
  'playlist.fetch': 'Buscar lista',
  'playlist.longWarningTitle': 'A lista é longa demais.',
  'playlist.longWarningCopy': 'Isso pode causar instabilidade no app. Esta playlist tem {count} vídeos.',
  'playlist.loadAnyway': 'Carregar mesmo assim',
  'playlist.loadFirst100': 'Carregar somente os primeiros 100',
  'playlist.videoCountOne': '1 vídeo',
  'playlist.videoCountMany': '{count} vídeos',
  'playlist.queueTitle': 'Fila da playlist',
  'playlist.queueEmpty': 'Remova vídeos ou carregue uma playlist para preencher a fila.',
  'playlist.downloadLabel': 'Baixar playlist',
  'playlist.errorMissingUrl': 'Cole uma URL de playlist do YouTube.',
  'playlist.errorInvalidUrl': 'A URL deve ser uma playlist do YouTube (com ?list=...).',
  'playlist.errorEmpty': 'A playlist está vazia ou nenhum vídeo foi encontrado.',

  'settings.eyebrow': 'Configurações',
  'settings.title': 'Preferências de download',
  'settings.quickReady': 'Download rápido configurado.',
  'settings.quickNeedsConfig': 'Configure pasta, formato e qualidade para ativar o download rápido.',
  'settings.directoryLabel': 'Diretório de downloads',
  'settings.chooseFolder': 'Escolher pasta',
  'settings.defaultFormat': 'Formato padrão',
  'settings.defaultQuality': 'Qualidade padrão',
  'settings.mp4Option': 'MP4 compatível',
  'settings.mp3Option': 'Áudio MP3',
  'settings.confirmQuickDownload': 'Confirmar download rápido',

  'youtube.hideSideList': 'Ocultar lista lateral',
  'youtube.showSideList': 'Mostrar lista lateral',
  'youtube.hideList': 'Ocultar lista',
  'youtube.showList': 'Mostrar lista',
  'youtube.duplicateToast': 'Este vídeo já estava na lista',
  'youtube.addedToast': 'Vídeo adicionado à lista',
  'youtube.clickedTitle': 'Vídeos clicados',
  'youtube.clickedEmpty': 'Abra o YouTube dentro do app e entre nos vídeos para adicioná-los a esta lista.',
  'youtube.clickedDownloadLabel': 'Baixar',
  'youtube.loading': 'Carregando YouTube...',
  'youtube.use': 'Usar',
  'youtube.quick': 'Rápido',
  'youtube.rightClickEmpty': 'Clique com o botão direito em um vídeo para adicioná-lo.',

  'downloadForm.urlLabel': 'URL do YouTube',
  'downloadForm.quickDownload': 'Download rápido',
  'downloadForm.quickReadyHelp': 'Usa a pasta, o formato e a qualidade compartilhados, sem preview.',
  'downloadForm.quickNeedsConfigHelp': 'Configure pasta, formato e qualidade para ativar.',
  'downloadForm.format': 'Formato',
  'downloadForm.quality': 'Qualidade',
  'downloadForm.downloadFolder': 'Pasta de download',
  'downloadForm.loadingPreview': 'Carregando preview...',
  'downloadForm.downloading': 'Baixando...',
  'downloadForm.downloadFormat': 'Baixar {format}',
  'downloadForm.viewPreview': 'Ver preview',

  'metadata.eyebrow': 'Preview dos metadados',
  'metadata.artist': 'Artista',
  'metadata.year': 'Ano',
  'metadata.duration': 'Duração',
  'metadata.authorUrl': 'URL do autor',
  'metadata.unavailable': 'Indisponível',

  'status.showInFolder': 'Mostrar na pasta',
  'status.version': 'Versão {version}',
  'status.stepPreparingDownload': 'Preparando download',
  'status.stepDownloadingFile': 'Baixando arquivo',
  'status.stepDownloadingCover': 'Baixando capa',
  'status.stepConverting': 'Convertendo',
  'status.stepMerging': 'Unificando arquivo',
  'status.stepCompleted': 'Concluído',
  'status.stepFailed': 'Erro',
  'status.timelinePreparing': 'Preparando',
  'status.timelineFile': 'Arquivo',
  'status.timelineConvert': 'Converter',
  'status.timelineComplete': 'Completo',
  'status.timelineMerge': 'Unificar',
  'status.idle': 'Em espera',
  'status.queued': 'Na fila',
  'status.starting': 'Preparando',
  'status.downloading': 'Baixando',
  'status.processing': 'Processando',
  'status.completed': 'Concluído',
  'status.failed': 'Erro',
  'status.eta': 'ETA {eta}',
  'status.calculatingProgress': 'Calculando progresso...',
  'status.approximateProgress': 'Progresso aproximado',
  'status.queuedStep': 'Aguardando vez',
  'status.readyStep': 'Pronto para baixar',
  'status.progressAriaLabel': 'Progresso do download',
  'status.waitingProgress': 'Aguardando progresso...',
  'status.readyMessage': 'Pronto para baixar.',
  'status.loadingPreviewMessage': 'Carregando preview dos metadados...',
  'status.previewFailedMessage': 'Não foi possível carregar o preview.',
  'status.previewReadyMessage': 'Preview pronto. Revise os dados e baixe.',
  'status.urlChangedMessage': 'A URL mudou. Carregando novo preview...',
  'status.batchActiveMessage': 'Uma lista está sendo baixada. Aguarde terminar.',
  'status.downloadActiveMessage': 'Já existe um download ativo. Aguarde terminar.',
  'status.preparingDownloadMessage': 'Preparando download...',
  'status.downloadedAt': 'Baixado em {path}',
  'status.downloadCompletedMessage': 'Download concluído.',
  'status.quickNeedsConfigMessage': 'Configure pasta, formato e qualidade em Configurações antes de usar o download rápido.',
  'status.missingYouTubeUrlMessage': 'Cole uma URL do YouTube primeiro.',
  'status.invalidYouTubeUrlMessage': 'A URL deve ser de youtube.com ou youtu.be.',
  'status.batchNeedsConfigMessage': 'Configure pasta, formato e qualidade em Configurações antes de baixar listas.',
  'status.noVideosMessage': 'Não há vídeos para baixar.',
  'status.batchSourcePlaylist': 'playlist',
  'status.batchSourceYouTube': 'vídeos clicados',
  'status.batchStarting': 'Baixando {count} vídeos de {source} em grupos de {batchSize}...',
  'status.batchProgress': 'Lista: {completed} concluídos, {failed} com falha, {pending} pendentes.',
  'status.batchFinishedWithFailures': 'Download da lista finalizado com {completed} concluídos e {failed} com falha.',
  'status.batchCompleted': 'Download da lista concluído: {completed} vídeos.',
  'status.queuedMessage': 'Na fila.',

  'queue.downloading': 'Baixando...',
  'queue.quickDownloadAria': 'Download rápido',
  'queue.quickDownloadTooltip': 'Download rápido',
  'queue.removeVideoAria': 'Remover vídeo',
  'queue.removeTooltip': 'Remover',

  'hero.title': 'Baixe YouTube em MP4 ou MP3',
  'hero.copy': 'Cole uma URL pública do YouTube. Baixe vídeo MP4 compatível ou áudio MP3 em Downloads/WhoDownloads.'
}

export const translations: Record<SupportedLanguage, Partial<TranslationCatalog>> = {
  en,
  es,
  pt
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match))
}

export function detectLanguage(languages: readonly string[] = []): SupportedLanguage {
  for (const language of languages) {
    const normalizedLanguage = language.toLowerCase()
    const baseLanguage = normalizedLanguage.split('-')[0]

    if (baseLanguage === 'en' || baseLanguage === 'es' || baseLanguage === 'pt') {
      return baseLanguage
    }
  }

  return 'en'
}

export function getBrowserLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return []
  }

  return navigator.languages?.length ? [...navigator.languages] : [navigator.language]
}

export function translate(
  language: SupportedLanguage,
  key: TranslationKey,
  values?: TranslationValues
): string {
  const template = translations[language][key] ?? en[key]
  return interpolate(template, values)
}

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const language = useMemo(() => detectLanguage(getBrowserLanguages()), [])
  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: (key, values) => translate(language, key, values)
    }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext)

  if (!value) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return value
}
