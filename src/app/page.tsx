import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Notion/Apple-style layout: max-width container, generous padding */}
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:px-12">
        <header className="mb-16">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Jamaican Eli Crazy
          </h1>
          <p className="mt-2 text-muted-foreground">
            Next.js · Supabase · shadcn · Notion-inspired design
          </p>
        </header>

        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-medium text-foreground">
              Design primitives
            </h2>
            <p className="text-muted-foreground">
              This boilerplate uses Apple/Notion-inspired tokens: soft neutrals,
              rounded corners, subtle shadows, and Geist for typography.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-border bg-card shadow-(--shadow-sm)">
              <CardHeader>
                <CardTitle className="text-lg">Card</CardTitle>
                <CardDescription>
                  shadcn card with theme variables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="demo">Label + Input</Label>
                  <Input
                    id="demo"
                    placeholder="Placeholder"
                    className="bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-(--shadow-sm)">
              <CardHeader>
                <CardTitle className="text-lg">Supabase</CardTitle>
                <CardDescription>
                  Auth and data via client & server utilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">createClient()</code> from{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">@/lib/supabase/client</code> or{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">@/lib/supabase/server</code>.
                  Add <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.local</code> from{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.example</code>.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
