import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a
          aria-label="LoteFlow, página inicial"
          className="text-lg font-semibold tracking-tight"
          href="#inicio"
        >
          LoteFlow<span className="text-primary">.</span>
        </a>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Em construção
        </span>
      </header>

      <main
        id="inicio"
        className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8"
      >
        <section
          aria-labelledby="hero-title"
          className="grid gap-12 pb-16 pt-12 sm:pb-24 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16"
        >
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-semibold tracking-wide text-primary">
              Preparação de planilhas de produtos
            </p>
            <h1
              className="font-serif text-4xl leading-[1.08] font-medium tracking-tight text-foreground sm:text-6xl"
              id="hero-title"
            >
              Mais clareza ao preparar planilhas de produtos.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Estamos construindo uma ferramenta para ajudar lojistas a preparar
              planilhas de produtos antes da importação. A análise de arquivos
              ainda não está disponível.
            </p>
            <div className="mt-8">
              <Button
                nativeButton={false}
                render={<a href="#privacidade" role="link" />}
                size="lg"
              >
                Conheça os princípios de privacidade
              </Button>
            </div>
          </div>

          <Card
            aria-label="Etapas previstas para preparar planilhas"
            className="relative overflow-hidden border-primary/15 bg-card shadow-sm"
            role="group"
          >
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-20 size-56 rounded-full bg-primary/5 blur-2xl"
            />
            <CardHeader className="relative border-b border-border/70 pb-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Uma base em construção
              </p>
              <CardTitle className="mt-2 font-serif text-2xl font-medium tracking-tight">
                <h2 className="font-inherit text-inherit">
                  O próximo passo, com cuidado.
                </h2>
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                A experiência será definida em etapas, com clareza sobre cada
                mudança feita nos dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative grid gap-4 pt-5">
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Revisar problemas antes de preparar uma planilha.
                </p>
              </div>
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2 shrink-0 rounded-full bg-primary/40"
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Preservar dados e colunas que não forem mapeados.
                </p>
              </div>
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2 shrink-0 rounded-full bg-primary/20"
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Explicar alterações antes de aplicá-las.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="privacy-title"
          className="border-t border-border py-12 sm:py-16"
          id="privacidade"
        >
          <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr] sm:gap-12">
            <h2
              className="font-serif text-2xl font-medium tracking-tight sm:text-3xl"
              id="privacy-title"
            >
              Privacidade desde a fundação
            </h2>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              O projeto prevê que o processamento de planilhas aconteça no seu
              navegador. Nenhum arquivo pode ser enviado ou analisado nesta
              versão inicial.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>LoteFlow · projeto em construção</p>
          <p>Sem upload ou análise de arquivos nesta versão.</p>
        </div>
      </footer>
    </>
  )
}
