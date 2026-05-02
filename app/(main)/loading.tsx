export default function MainLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 bg-primary rounded-sm animate-pulse" />
        <span className="text-muted-foreground text-sm font-medium tracking-widest">LOADING</span>
      </div>
    </div>
  )
}
