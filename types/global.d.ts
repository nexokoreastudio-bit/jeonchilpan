export {}

declare global {
  interface Window {
    sidebar?: {
      addPanel?: (url: string, title: string, something?: string) => void
    }
    external?: {
      AddFavorite?: (url: string, title: string) => void
    }
  }
}
