'use client'

/**
 * RegistrationWalkthrough
 * 
 * A multi-page walkthrough system that guides users through the registration flow:
 * 1. Log in as club owner
 * 2. Click on an event
 * 3. Start registration
 * 4. Register a team
 * 5. Submit registration
 * 6. View registration
 * 7. Pay invoice
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { XIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/shadcn/popover'
import { Button } from '@workspace/ui/shadcn/button'
import { cn } from '@workspace/ui/lib/utils'

// Walkthrough steps
export const WALKTHROUGH_STEPS = [
  {
    id: 'login',
    title: 'Welcome to Cheerbase!',
    description: 'Let\'s walk through registering for an event. First, log in as a Club Owner to access your dashboard.',
    action: 'Click "Log in" to continue',
    page: '/',
  },
  {
    id: 'select-event',
    title: 'Find an Event',
    description: 'Browse upcoming events and find one you\'d like to register for.',
    action: 'Click on any event to view details',
    page: '/',
  },
  {
    id: 'start-registration',
    title: 'Start Registration',
    description: 'Ready to register your teams? Click the registration button to begin.',
    action: 'Click "Register" to start',
    page: '/events/',
  },
  {
    id: 'register-team',
    title: 'Register Your Team',
    description: 'Select a division and add your team to the registration. You can register multiple teams at once.',
    action: 'Click "Register Team" to add a team',
    page: '/register',
  },
  {
    id: 'submit-registration',
    title: 'Submit Registration',
    description: 'Review your teams and the invoice summary. When ready, submit your registration.',
    action: 'Click "Submit Registration" when ready',
    page: '/register',
  },
  {
    id: 'view-registration',
    title: 'Registration Complete!',
    description: 'Your registration is confirmed. View your registration details to see your teams and invoice.',
    action: 'Click "View Registration" to continue',
    page: '/confirmation',
  },
  {
    id: 'pay-invoice',
    title: 'Complete Payment',
    description: 'View your invoice and complete payment to finalize your registration.',
    action: 'Click "Pay Invoice" to proceed',
    page: '/registrations/',
  },
  {
    id: 'complete',
    title: 'All Done! 🎉',
    description: 'You\'ve completed the registration walkthrough. You\'re now ready to register for any event on Cheerbase!',
    action: '',
    page: '/invoice',
  },
] as const

export type WalkthroughStepId = typeof WALKTHROUGH_STEPS[number]['id']

const STORAGE_KEY = 'cheerbase-registration-walkthrough'

type WalkthroughState = {
  isActive: boolean
  currentStep: WalkthroughStepId
  completedSteps: WalkthroughStepId[]
}

type WalkthroughContextType = {
  state: WalkthroughState
  isActive: boolean
  currentStep: WalkthroughStepId
  currentStepIndex: number
  totalSteps: number
  startWalkthrough: () => void
  endWalkthrough: () => void
  nextStep: () => void
  goToStep: (step: WalkthroughStepId) => void
  isStepActive: (step: WalkthroughStepId) => boolean
  getStepInfo: (step: WalkthroughStepId) => typeof WALKTHROUGH_STEPS[number] | undefined
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null)

export function useRegistrationWalkthrough() {
  const context = useContext(WalkthroughContext)
  if (!context) {
    throw new Error('useRegistrationWalkthrough must be used within WalkthroughProvider')
  }
  return context
}

// Safe hook that doesn't throw if outside provider
export function useRegistrationWalkthroughSafe() {
  return useContext(WalkthroughContext)
}

function loadState(): WalkthroughState {
  if (typeof window === 'undefined') {
    return { isActive: false, currentStep: 'login', completedSteps: [] }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load walkthrough state:', e)
  }
  return { isActive: false, currentStep: 'login', completedSteps: [] }
}

function saveState(state: WalkthroughState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save walkthrough state:', e)
  }
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalkthroughState>(() => loadState())

  // Sync to localStorage
  useEffect(() => {
    saveState(state)
  }, [state])

  // Load state on mount
  useEffect(() => {
    setState(loadState())
  }, [])

  const startWalkthrough = useCallback(() => {
    setState({
      isActive: true,
      currentStep: 'login',
      completedSteps: [],
    })
  }, [])

  const endWalkthrough = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
    }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => {
      const currentIndex = WALKTHROUGH_STEPS.findIndex(s => s.id === prev.currentStep)
      const nextIndex = currentIndex + 1
      const nextStepData = WALKTHROUGH_STEPS[nextIndex]
      
      if (nextIndex >= WALKTHROUGH_STEPS.length || !nextStepData) {
        return { ...prev, isActive: false }
      }
      
      return {
        ...prev,
        currentStep: nextStepData.id,
        completedSteps: [...prev.completedSteps, prev.currentStep],
      }
    })
  }, [])

  const goToStep = useCallback((step: WalkthroughStepId) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
    }))
  }, [])

  const isStepActive = useCallback((step: WalkthroughStepId) => {
    return state.isActive && state.currentStep === step
  }, [state.isActive, state.currentStep])

  const getStepInfo = useCallback((step: WalkthroughStepId) => {
    return WALKTHROUGH_STEPS.find(s => s.id === step)
  }, [])

  const currentStepIndex = WALKTHROUGH_STEPS.findIndex(s => s.id === state.currentStep)

  const value: WalkthroughContextType = {
    state,
    isActive: state.isActive,
    currentStep: state.currentStep,
    currentStepIndex,
    totalSteps: WALKTHROUGH_STEPS.length,
    startWalkthrough,
    endWalkthrough,
    nextStep,
    goToStep,
    isStepActive,
    getStepInfo,
  }

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  )
}

// Walkthrough spotlight component that wraps elements
type WalkthroughSpotlightProps = {
  step: WalkthroughStepId
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
  onAction?: () => void
  /** If true, advances to next step on click instead of calling onAction */
  advanceOnClick?: boolean
}

export function WalkthroughSpotlight({
  step,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 12,
  className,
  onAction,
  advanceOnClick = false,
}: WalkthroughSpotlightProps) {
  const context = useRegistrationWalkthroughSafe()
  
  if (!context) {
    return <>{children}</>
  }

  const { isStepActive, getStepInfo, nextStep, endWalkthrough, currentStepIndex, totalSteps } = context
  const isActive = isStepActive(step)
  const stepInfo = getStepInfo(step)

  if (!isActive || !stepInfo) {
    return <>{children}</>
  }

  const handleAction = () => {
    if (advanceOnClick) {
      nextStep()
    }
    onAction?.()
  }

  const isLastStep = step === 'complete'
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  return (
    <>
      {/* Dark overlay - portaled to body */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px] animate-in fade-in-0 duration-300"
          onClick={endWalkthrough}
          aria-hidden="true"
        />,
        document.body
      )}
      
      {/* Spotlight wrapper */}
      <Popover open={true}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'relative z-[9999] rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background transition-all duration-300',
              className
            )}
            onClick={handleAction}
          >
            {children}
          </div>
        </PopoverTrigger>
        <PopoverContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-[10000] w-80 rounded-lg border-border/70 bg-card p-0 shadow-xl"
        >
          <div className="flex flex-col gap-3 p-4">
            {/* Progress bar */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-medium">{currentStepIndex + 1}/{totalSteps}</span>
            </div>
            
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{stepInfo.title}</p>
              <button
                onClick={endWalkthrough}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="End walkthrough"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground">{stepInfo.description}</p>
            
            {/* Action hint */}
            {stepInfo.action && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <ArrowRightIcon className="size-3" />
                <span>{stepInfo.action}</span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={endWalkthrough}
                className="text-muted-foreground"
              >
                Skip tour
              </Button>
              {isLastStep ? (
                <Button size="sm" onClick={endWalkthrough}>
                  <CheckIcon className="size-4 mr-1" />
                  Finish
                </Button>
              ) : advanceOnClick ? (
                <span className="text-xs text-muted-foreground">Click the highlighted element</span>
              ) : (
                <Button size="sm" onClick={nextStep}>
                  Next
                  <ArrowRightIcon className="size-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

// Button to start the walkthrough
export function StartWalkthroughButton({ className }: { className?: string }) {
  const context = useRegistrationWalkthroughSafe()
  
  if (!context) return null
  
  const { startWalkthrough, isActive } = context

  if (isActive) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startWalkthrough}
      className={cn('gap-2', className)}
    >
      <span className="relative flex size-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full size-2 bg-primary" />
      </span>
      Take a tour
    </Button>
  )
}

// Floating walkthrough trigger button
export function WalkthroughFloatingTrigger() {
  const context = useRegistrationWalkthroughSafe()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!context || !mounted) return null
  
  const { startWalkthrough, isActive } = context

  if (isActive) return null

  return createPortal(
    <button
      onClick={startWalkthrough}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
    >
      <span className="relative flex size-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
        <span className="relative inline-flex rounded-full size-2 bg-primary-foreground" />
      </span>
      Take a tour
    </button>,
    document.body
  )
}

