"use client"

import { useState } from "react"
import { SAMPLE_PRODUCTS } from "@/domain/sample-demo/products"
import { validateSampleProducts } from "@/domain/sample-demo/validate-products"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="min-w-0 gap-2 py-4">
      <CardContent>
        <dl>
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </dd>
        </dl>
      </CardContent>
    </Card>
  )
}

export function SampleDemo() {
  const [isLoaded, setIsLoaded] = useState(false)
  const report = isLoaded ? validateSampleProducts(SAMPLE_PRODUCTS) : null

  return (
    <section
      aria-labelledby="demo-title"
      className="border-t border-border py-14 sm:py-20"
      id="demonstracao"
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="max-w-md">
          <p className="text-sm font-semibold tracking-wide text-primary">
            Demonstração local
          </p>
          <h2
            className="mt-3 font-serif text-3xl leading-tight font-medium tracking-tight text-foreground sm:text-4xl"
            id="demo-title"
          >
            Veja problemas antes de preparar a planilha.
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Carregue um exemplo fictício para conhecer as validações genéricas.
            Nenhum arquivo é necessário.
          </p>
          <Button
            className="mt-6 h-10"
            onClick={() => setIsLoaded(true)}
            type="button"
          >
            {isLoaded ? "Exemplo carregado" : "Carregar exemplo"}
          </Button>
          <p
            aria-live="polite"
            className="mt-3 text-sm text-muted-foreground"
            role="status"
          >
            {report
              ? `${report.lineCount} linhas fictícias analisadas. ${report.findingCount} apontamentos em ${report.affectedLineCount} linhas.`
              : "O exemplo ainda não foi carregado."}
          </p>
        </div>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="font-serif text-xl font-medium tracking-tight">
              Resultado da demonstração
            </CardTitle>
            <CardDescription className="leading-6">
              Dados fictícios. As validações são genéricas e não garantem
              aceitação por nenhum ERP.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-5 pt-5">
            {report ? (
              <>
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                  <SummaryCard
                    label="Linhas analisadas"
                    value={report.lineCount}
                  />
                  <SummaryCard
                    label="Linhas para revisar"
                    value={report.affectedLineCount}
                  />
                  <SummaryCard
                    label="Apontamentos"
                    value={report.findingCount}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Linhas que precisam de revisão
                  </h3>
                  <p className="mb-2 text-xs text-muted-foreground sm:hidden">
                    Role a tabela na horizontal para consultar todos os
                    apontamentos.
                  </p>
                  <div className="min-w-0 rounded-xl border border-border">
                    <Table
                      className="min-w-170 border-collapse text-left text-sm"
                      containerAriaLabel="Resultados da demonstração. Role para consultar todas as colunas."
                    >
                      <TableCaption className="sr-only">
                        Produtos fictícios com apontamentos de validação
                        genérica
                      </TableCaption>
                      <TableHeader className="bg-muted/70 text-xs text-muted-foreground">
                        <TableRow>
                          <TableHead className="px-4 py-3" scope="col">
                            Linha
                          </TableHead>
                          <TableHead className="px-4 py-3" scope="col">
                            SKU
                          </TableHead>
                          <TableHead className="px-4 py-3" scope="col">
                            Produto
                          </TableHead>
                          <TableHead className="px-4 py-3" scope="col">
                            Apontamentos
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-border">
                        {report.lines.map(
                          ({ lineNumber, product, findings }) => (
                            <TableRow className="align-top" key={product.id}>
                              <TableHead
                                className="px-4 py-4 font-medium tabular-nums text-foreground"
                                scope="row"
                              >
                                {lineNumber}
                              </TableHead>
                              <TableCell className="px-4 py-4 font-mono text-xs text-foreground">
                                {product.sku || "—"}
                              </TableCell>
                              <TableCell className="max-w-48 px-4 py-4 text-foreground">
                                {product.description || "Sem descrição"}
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <ul className="grid gap-2">
                                  {findings.map(({ field, message }) => (
                                    <li
                                      className="flex flex-wrap items-center gap-2 leading-5"
                                      key={`${field}-${message}`}
                                    >
                                      <Badge variant="outline">{field}</Badge>
                                      <span className="text-muted-foreground">
                                        {message}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            ) : (
              <Alert className="bg-muted/60" role="note">
                <AlertTitle>O que o exemplo verifica</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 grid gap-2 leading-6 text-muted-foreground sm:grid-cols-2">
                    <li>SKU repetido</li>
                    <li>GTIN com dígito verificador inválido</li>
                    <li>Descrição ausente</li>
                    <li>Preço ou estoque não numérico</li>
                    <li>Linha vazia</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
