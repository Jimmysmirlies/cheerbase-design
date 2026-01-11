"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { InlineEditCard } from "@/components/features/events/editor/InlineEditCard";
import { EmptyStateButton } from "@/components/ui/buttons/EmptyStateButton";
import { inlineExpandCollapse, fadeInUp } from "@/lib/animations";
import type { SectionWrapperProps } from "./types";

/**
 * SectionWrapper handles the view/edit mode transitions for event detail sections.
 *
 * In view-only mode (no onStartEdit): Uses the Section component for layout
 * In editable mode: Shows edit button, handles animation for inline edit card
 */
export function SectionWrapper({
  id,
  title,
  titleRight,
  isEditing = false,
  onStartEdit,
  onSave,
  onCancel,
  isSaving = false,
  showDivider = true,
  viewContent,
  editContent,
  emptyState,
  hasData,
}: SectionWrapperProps) {
  // Pure view mode (no edit capability)
  if (!onStartEdit) {
    // In view-only mode, hide empty sections entirely
    if (!hasData) return null;

    return (
      <motion.div variants={fadeInUp}>
        <Section id={id} title={title} titleRight={titleRight} showDivider={showDivider}>
          {viewContent}
        </Section>
      </motion.div>
    );
  }

  // Editable mode - matches Section component layout (py-12 gap-6)
  return (
    <motion.div variants={fadeInUp}>
      <div id={id}>
        {showDivider && <div className="h-px w-full bg-border" />}

        <div className="flex flex-col gap-6 py-12">
          <div className="flex items-center justify-between">
            <p className="heading-4">{title}</p>
            {titleRight}
            {!isEditing && (
              <button
                type="button"
                onClick={onStartEdit}
                className="text-sm text-foreground underline hover:no-underline"
              >
                Edit
              </button>
            )}
          </div>

          {/* Inline Edit Card with animation */}
          <AnimatePresence mode="wait">
            {isEditing && editContent && (
              <motion.div
                key={`${id}-editor`}
                variants={inlineExpandCollapse}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden"
              >
                <InlineEditCard
                  onSave={onSave!}
                  onCancel={onCancel!}
                  isSaving={isSaving}
                >
                  {editContent}
                </InlineEditCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View content or Empty state */}
          {!isEditing && (
            <>
              {hasData ? (
                viewContent
              ) : (
                emptyState || (
                  <EmptyStateButton
                    title={`Add ${title.toLowerCase()}`}
                    description={`Configure ${title.toLowerCase()} for your event`}
                    onClick={onStartEdit}
                  />
                )
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
