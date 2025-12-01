'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/shadcn/dialog'
import { Button } from '@workspace/ui/shadcn/button'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/shadcn/card'
import { toast } from '@workspace/ui/shadcn/sonner'
import { useAuth } from '@/components/providers/AuthProvider'
import { HomeIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/shadcn/form'
import { passwordFieldsSchema } from '@/utils/passwordSchema'

type AuthSignUpRenderProps = {
  openStart: (step?: 'choose' | 'club' | 'organizer') => void
}

type AuthSignUpProps = {
  children: (controls: AuthSignUpRenderProps) => React.ReactNode
}

export function AuthSignUp({ children }: AuthSignUpProps) {
  const router = useRouter()
  const { signUp } = useAuth()

  const [startOpen, setStartOpen] = useState(false)
  const [startStep, setStartStep] = useState<'choose' | 'club' | 'organizer'>('choose')
  const [orgForm, setOrgForm] = useState({ contactName: '', email: '', companyName: '', website: '', notes: '' })
  const [signupSubmitting, setSignupSubmitting] = useState(false)
  const [orgSubmitting, setOrgSubmitting] = useState(false)

  const clubFormSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, 'Name is required'),
          email: z.string().email('Enter a valid email'),
          clubName: z.string().min(1, 'Club name is required'),
        })
        .merge(passwordFieldsSchema)
        .superRefine((values, ctx) => {
          if (values.password !== values.confirmPassword) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['confirmPassword'],
              message: 'Passwords do not match',
            })
          }
        }),
    []
  )

  const clubFormMethods = useForm<z.infer<typeof clubFormSchema>>({
    resolver: zodResolver(clubFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      clubName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleClubSignup = async (values: z.infer<typeof clubFormSchema>) => {
    setSignupSubmitting(true)
    try {
      await signUp({
        name: values.name,
        email: values.email,
        role: 'club_owner',
        clubName: values.clubName,
      })
      toast.success('Welcome! Your club profile is created.')
      setStartOpen(false)
      setStartStep('choose')
      router.push('/clubs')
    } catch (error) {
      console.error(error)
      toast.error('Unable to sign up. Please try again.')
    } finally {
      setSignupSubmitting(false)
    }
  }

  const handleOrganizerSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!orgForm.contactName.trim() || !orgForm.email.trim() || !orgForm.companyName.trim()) {
      toast.error('Please fill in required fields.')
      return
    }
    setOrgSubmitting(true)
    try {
      await fetch('/api/organizer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: orgForm.companyName,
          contactName: orgForm.contactName,
          email: orgForm.email,
          website: orgForm.website,
          notes: orgForm.notes,
        }),
      })
      toast.success('Application submitted. We will verify your organization shortly.')
      setStartOpen(false)
      setStartStep('choose')
    } catch (error) {
      console.error(error)
      toast.error('Unable to submit application. Please try again.')
    } finally {
      setOrgSubmitting(false)
    }
  }

  return (
    <>
      {children({
        openStart: (step = 'choose') => {
          setStartStep(step)
          setStartOpen(true)
        },
      })}

      {/* Get Started modal (choose path + inline signup) */}
      <Dialog
        open={startOpen}
        onOpenChange={open => {
          setStartOpen(open)
          if (!open) setStartStep('choose')
        }}
      >
        <DialogContent className="max-w-[640px] p-8 sm:p-8">
          {startStep === 'choose' ? (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Step 1 of 2 · Choose your path</DialogTitle>
                <DialogDescription>
                  Pick how you want to get started. Club organizers create teams and people under their clubOwnerId; event organizers submit an application for verification.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <Card className="border-border/80">
                  <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UsersIcon className="text-primary size-5" />
                      Club Owner
                    </CardTitle>
                    <CardDescription>Create teams, manage rosters, and register for competitions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> Create and edit teams & rosters.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> Register teams into events.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> Track payments and deadlines.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full justify-between" onClick={() => setStartStep('club')}>
                      Start as Club Owner
                      <HomeIcon className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="border-border/80">
                  <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldCheckIcon className="text-primary size-5" />
                      Organizer
                    </CardTitle>
                    <CardDescription>Manage events, registrations, and payouts from a dedicated portal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> Set up events, divisions, and pricing.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> Review club registrations.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> Track payments and logistics.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full justify-between" onClick={() => setStartStep('organizer')}>
                      Start as Organizer
                      <HomeIcon className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
            ) : startStep === 'club' ? (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Step 2 of 2 · Club organizer setup</DialogTitle>
                <DialogDescription>Set up your profile and start managing teams and registrations under your clubOwnerId.</DialogDescription>
              </DialogHeader>
              <Form {...clubFormMethods}>
                <form className="space-y-4" onSubmit={clubFormMethods.handleSubmit(handleClubSignup)}>
                  <FormField
                    control={clubFormMethods.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Alex Coach" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="you@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Create a password" />
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          At least 8 characters, with upper, lower, number, and special (!@#$%^&*).
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Re-enter password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="clubName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Sapphire Cheer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="flex justify-between">
                    <Button type="button" variant="ghost" onClick={() => setStartStep('choose')}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={signupSubmitting || !clubFormMethods.formState.isValid}
                    >
                      {signupSubmitting ? 'Creating account...' : 'Continue to club workspace'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          ) : (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Step 2 of 2 · Organizer application</DialogTitle>
                <DialogDescription>
                  Event organizers require manual verification. Share your details and we’ll review and set up your organizer environment.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleOrganizerSignup}>
                <div className="space-y-2">
                  <Label htmlFor="org-name">Contact name</Label>
                  <Input
                    id="org-name"
                    value={orgForm.contactName}
                    onChange={event => setOrgForm(prev => ({ ...prev, contactName: event.target.value }))}
                    placeholder="Jordan Director"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={orgForm.email}
                    onChange={event => setOrgForm(prev => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-orgname">Organization</Label>
                  <Input
                    id="org-orgname"
                    value={orgForm.companyName}
                    onChange={event => setOrgForm(prev => ({ ...prev, companyName: event.target.value }))}
                    placeholder="Summit Events Co."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    value={orgForm.website}
                    onChange={event => setOrgForm(prev => ({ ...prev, website: event.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-notes">Notes</Label>
                  <Input
                    id="org-notes"
                    value={orgForm.notes}
                    onChange={event => setOrgForm(prev => ({ ...prev, notes: event.target.value }))}
                    placeholder="Events you run, expected dates, locations..."
                  />
                </div>
                <DialogFooter className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStartStep('choose')}>
                    Back
                  </Button>
                  <Button type="submit" disabled={orgSubmitting}>
                    {orgSubmitting ? 'Submitting...' : 'Submit application'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
