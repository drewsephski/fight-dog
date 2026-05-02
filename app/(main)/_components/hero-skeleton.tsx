export function HeroSkeleton() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="text-primary text-sm font-bold tracking-widest mb-2 sm:mb-3">UPCOMING</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">FEATURED FIGHTS</h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border p-4 sm:p-6 animate-pulse rounded-sm"
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-full mb-2 sm:mb-3 mx-auto" />
                  <div className="h-4 bg-accent rounded w-16 sm:w-20 mx-auto" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-muted-foreground/30">VS</div>
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent rounded-full mb-2 sm:mb-3 mx-auto" />
                  <div className="h-4 bg-accent rounded w-16 sm:w-20 mx-auto" />
                </div>
              </div>
              <div className="h-4 bg-accent rounded w-full mb-3 sm:mb-4" />
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
                <div className="h-3 bg-accent rounded w-16" />
                <div className="h-3 bg-accent rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
