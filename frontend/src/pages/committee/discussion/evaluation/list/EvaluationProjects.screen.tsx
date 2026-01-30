import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Badge,
} from "@/components/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { BlockContent, LoadingSpinner } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Search,
    Users,
    CheckCircle2,
    ClipboardCheck,
    Lock,
    AlertCircle,
    GraduationCap,
    FileText,
    User,
    Eye,
    Edit3,
} from "lucide-react";
import { usePeriodCheck } from "@/hooks/usePeriodCheck";
import { committeeEvaluationService } from "../api/evaluation.service";
import { UnifiedEvaluationModal } from "../components/UnifiedEvaluationModal";
import type { EvaluationProjectItem } from "../types/Evaluation.types";

export function EvaluationProjectsScreen() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState<EvaluationProjectItem | null>(null);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);

    const { isPeriodActive: isPhase1Active, isLoading: phase1Loading } = usePeriodCheck("final_defense_phase_1");
    const { isPeriodActive: isPhase2Active, isLoading: phase2Loading } = usePeriodCheck("final_defense_phase_2");
    const isPeriodActive = isPhase1Active || isPhase2Active;
    const periodLoading = phase1Loading || phase2Loading;

    // Fetch projects
    const { data: projects, isLoading, error, refetch } = useQuery({
        queryKey: ["discussion-committee-evaluation-projects"],
        queryFn: () => committeeEvaluationService.getProjects(),
        staleTime: 0,
    });

    // Filter projects by search
    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        if (!searchQuery.trim()) return projects;
        const q = searchQuery.toLowerCase();
        return projects.filter(
            (item) =>
                item.project.title.toLowerCase().includes(q) ||
                item.project.description?.toLowerCase().includes(q) ||
                item.project.supervisor?.name?.toLowerCase().includes(q)
        );
    }, [projects, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        if (!projects) return { total: 0, completed: 0, inProgress: 0, locked: 0 };
        return {
            total: projects.length,
            completed: projects.filter((p) => p.evaluationProgress === 100).length,
            inProgress: projects.filter((p) => p.evaluationProgress > 0 && p.evaluationProgress < 100).length,
            locked: projects.filter((p) => p.isLocked).length,
        };
    }, [projects]);

    const handleEvaluate = (item: EvaluationProjectItem) => {
        setSelectedProject(item);
        setShowEvaluationModal(true);
    };

    const handleEvaluationSuccess = () => {
        refetch();
        setShowEvaluationModal(false);
        setSelectedProject(null);
    };

    if (periodLoading || isLoading) {
        return (
            <BlockContent title={t("discussion.finalEvaluation")} variant="data-table">
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner />
                </div>
            </BlockContent>
        );
    }

    if (!isPeriodActive) {
        return (
            <BlockContent title={t("discussion.finalEvaluation")} variant="data-table">
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="h-5 w-5" />
                            {t("discussion.evaluationPeriodClosed")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {t("discussion.evaluationPeriodClosedMessage")}
                        </p>
                    </CardContent>
                </Card>
            </BlockContent>
        );
    }

    if (error) {
        return (
            <BlockContent title={t("discussion.finalEvaluation")} variant="data-table">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{t("discussion.loadError")}</AlertDescription>
                </Alert>
            </BlockContent>
        );
    }

    return (
        <BlockContent title={t("discussion.finalEvaluation")} variant="data-table">
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                                <ClipboardCheck className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">
                                    {t("common.totalProjects")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-0 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.completed}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t("common.completed")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-0 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                                <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {stats.inProgress}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t("common.inProgress")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-950/20 dark:to-zinc-950/20 border-0 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/20">
                                <Lock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                                    {stats.locked}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t("common.locked")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("discussion.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Projects List */}
                {filteredProjects.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                {t("discussion.noProjects")}
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                {t("discussion.noProjectsDescription")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((item) => (
                            <ProjectCard
                                key={item.project.id}
                                item={item}
                                onEvaluate={handleEvaluate}
                                t={t}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Evaluation Modal */}
            <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-primary" />
                            {t("discussion.evaluateProject")}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedProject?.project.title}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProject && (
                        <UnifiedEvaluationModal
                            open={showEvaluationModal}
                            onOpenChange={setShowEvaluationModal}
                            projectId={selectedProject.project.id}
                            role="discussion_committee"
                            onSuccess={handleEvaluationSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </BlockContent>
    );
}

interface ProjectCardProps {
    item: EvaluationProjectItem;
    onEvaluate: (item: EvaluationProjectItem) => void;
    t: (key: string) => string;
}

function ProjectCard({ item, onEvaluate, t }: ProjectCardProps) {
    const { project, studentsCount, evaluatedCount, isLocked, evaluationProgress } = item;
    const isComplete = evaluationProgress === 100;

    return (
        <Card
            className={`group overflow-hidden border transition-all duration-200 hover:shadow-lg ${isLocked
                ? "border-slate-200 dark:border-slate-800"
                : isComplete
                    ? "border-green-200 dark:border-green-900/50"
                    : "border-border/50 hover:border-primary/30"
                }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold line-clamp-2">
                            {project.title}
                        </CardTitle>
                        {project.supervisor && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span className="truncate">{project.supervisor.name}</span>
                            </div>
                        )}
                    </div>
                    {isLocked && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                            <Lock className="h-3 w-3" />
                            {t("common.locked")}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Description */}
                {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                    </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{studentsCount} {t("common.students")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>{evaluatedCount}/{studentsCount} {t("discussion.evaluated")}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full transition-all duration-500 ${isComplete
                                ? "bg-green-500"
                                : evaluationProgress > 0
                                    ? "bg-primary"
                                    : "bg-muted"
                                }`}
                            style={{ width: `${evaluationProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        {evaluationProgress}% {t("common.complete")}
                    </p>
                </div>

                {/* Action Button */}
                <Button
                    onClick={() => onEvaluate(item)}
                    variant={isLocked ? "outline" : isComplete ? "secondary" : "default"}
                    className="w-full gap-2"
                >
                    {isLocked ? (
                        <>
                            <Eye className="h-4 w-4" />
                            {t("common.view")}
                        </>
                    ) : isComplete ? (
                        <>
                            <Edit3 className="h-4 w-4" />
                            {t("common.edit")}
                        </>
                    ) : (
                        <>
                            <ClipboardCheck className="h-4 w-4" />
                            {t("common.evaluate")}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

export default EvaluationProjectsScreen;
