import { FileText, PlusCircle, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface EmptyProposalsStateProps {
    t: (key: string) => string
    canSubmit: boolean
    isReadOnly: boolean
    onSubmit?: () => void
}

export function EmptyProposalsState({
    t,
    canSubmit,
    isReadOnly,
    onSubmit
}: EmptyProposalsStateProps) {
    return (
        <div className="relative flex flex-col items-center justify-center py-12 px-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-2xl" />
            </div>

            {/* Icon container with animated ring */}
            <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping bg-primary/10 rounded-full" style={{ animationDuration: '3s' }} />
                <div className={cn(
                    'relative flex items-center justify-center w-16 h-16 rounded-full',
                    'bg-gradient-to-br from-primary/10 to-primary/5',
                    'ring-1 ring-primary/20'
                )}>
                    <FileText className="h-8 w-8 text-primary/60" />
                </div>
            </div>

            {/* Main message */}
            <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                {t('proposal.noProposals')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md text-center mb-5">
                {isReadOnly
                    ? t('proposal.readOnlyDescription')
                    : t('proposal.noProposalsDescription')
                }
            </p>

            {/* Action button for leaders */}
            {canSubmit && !isReadOnly && onSubmit && (
                <Button
                    onClick={onSubmit}
                    size="lg"
                    className="gap-2 group"
                >
                    <PlusCircle className="h-5 w-5" />
                    {t('proposal.submitNew')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            )}

            {/* Tips section */}
            {canSubmit && !isReadOnly && (
                <div className="mt-8 grid gap-4 md:grid-cols-3 w-full max-w-2xl">
                    {[
                        {
                            icon: FileText,
                            titleKey: 'proposal.tipTitle1',
                            descKey: 'proposal.tipDesc1',
                            fallbackTitle: 'Clear Title',
                            fallbackDesc: 'Choose a descriptive title that reflects your project idea',
                        },
                        {
                            icon: Lightbulb,
                            titleKey: 'proposal.tipTitle2',
                            descKey: 'proposal.tipDesc2',
                            fallbackTitle: 'Detailed Description',
                            fallbackDesc: 'Explain your project goals and methodology clearly',
                        },
                        {
                            icon: PlusCircle,
                            titleKey: 'proposal.tipTitle3',
                            descKey: 'proposal.tipDesc3',
                            fallbackTitle: 'Multiple Proposals',
                            fallbackDesc: 'Submit multiple proposals to increase your chances',
                        },
                    ].map((tip, index) => {
                        const Icon = tip.icon
                        return (
                            <div
                                key={index}
                                className={cn(
                                    'flex flex-col items-center p-4 rounded-lg text-center',
                                    'bg-muted/30 border border-border/50',
                                    'transition-all duration-200 hover:bg-muted/50 hover:border-primary/20'
                                )}
                            >
                                <div className="p-2 rounded-full bg-primary/10 mb-3">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <h4 className="text-sm font-medium text-foreground mb-1">
                                    {t(tip.titleKey) !== tip.titleKey ? t(tip.titleKey) : tip.fallbackTitle}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {t(tip.descKey) !== tip.descKey ? t(tip.descKey) : tip.fallbackDesc}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
