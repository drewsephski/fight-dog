import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-card border border-border shadow-2xl',
            headerTitle: 'text-foreground font-bold',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'bg-accent border border-border hover:bg-accent/80 text-foreground',
            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground',
            formFieldLabel: 'text-foreground/80',
            formFieldInput: 'bg-accent border-border text-foreground placeholder:text-muted-foreground/50',
            footerActionLink: 'text-primary hover:text-primary-hover',
            formButtonPrimary: 'bg-primary hover:bg-primary-hover text-primary-foreground font-bold',
          },
        }}
      />
    </div>
  )
}
