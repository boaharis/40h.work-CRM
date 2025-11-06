'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantStore } from '@/stores/tenantStore';
import { Lead, PipelineStage } from '@/types';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function LeadsPage() {
  const { claims } = useAuth();
  const { tenant } = useTenantStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!claims?.tenantId) return;

    const leadsQuery = query(
      collection(db, `tenants/${claims.tenantId}/leads`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[];

      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [claims]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !claims?.tenantId) return;

    const leadId = active.id as string;
    const newStage = over.id as string;
    const lead = leads.find((l) => l.id === leadId);

    if (!lead || lead.pipelineStage === newStage) {
      setActiveId(null);
      return;
    }

    // Update lead in Firestore
    try {
      const leadRef = doc(db, `tenants/${claims.tenantId}/leads`, leadId);

      const pipelineHistory = [
        ...(lead.pipelineHistory || []),
        {
          stage: newStage,
          enteredAt: serverTimestamp(),
          movedBy: claims.uid,
        },
      ];

      await updateDoc(leadRef, {
        pipelineStage: newStage,
        pipelineHistory,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating lead:', error);
    }

    setActiveId(null);
  };

  const pipelineStages: PipelineStage[] = tenant?.config.pipelineStages || [];

  const getLeadsByStage = (stageId: string): Lead[] => {
    return leads.filter((lead) => lead.pipelineStage === stageId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Lead Pipeline</h1>
          <p className="text-neutral-600 mt-1">Track and manage your sales opportunities</p>
        </div>
        <a
          href="/dashboard/leads/new"
          className="btn btn-primary"
        >
          + Add Lead
        </a>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-7 gap-4 h-[calc(100vh-16rem)] overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);

            return (
              <div
                key={stage.id}
                className="flex flex-col min-w-[280px]"
              >
                <div
                  className="flex items-center justify-between p-3 rounded-t-lg"
                  style={{ backgroundColor: stage.color + '20' }}
                >
                  <h3 className="font-semibold text-neutral-900">{stage.name}</h3>
                  <span className="text-sm text-neutral-600 bg-white px-2 py-1 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                <SortableContext
                  id={stage.id}
                  items={stageLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableStage
                    stageId={stage.id}
                    leads={stageLeads}
                    color={stage.color}
                  />
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeId ? (
            <LeadCard
              lead={leads.find((l) => l.id === activeId)!}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DroppableStage({
  stageId,
  leads,
  color,
}: {
  stageId: string;
  leads: Lead[];
  color: string;
}) {
  const { setNodeRef } = useSortable({ id: stageId });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 bg-neutral-100 rounded-b-lg p-3 space-y-3 overflow-y-auto"
    >
      {leads.length === 0 ? (
        <div className="text-center text-neutral-400 py-8 text-sm">
          No leads in this stage
        </div>
      ) : (
        leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
      )}
    </div>
  );
}

function LeadCard({ lead, isDragging = false }: { lead: Lead; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-neutral-900">
          {lead.firstName} {lead.lastName}
        </h4>
        <span className="text-xs text-neutral-500">
          {lead.score}%
        </span>
      </div>

      <div className="space-y-1 text-sm text-neutral-600">
        <div className="flex items-center">
          <span className="text-neutral-500">📧</span>
          <span className="ml-2 truncate">{lead.email}</span>
        </div>
        <div className="flex items-center">
          <span className="text-neutral-500">📞</span>
          <span className="ml-2">{lead.phone}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900">
          ${lead.estimatedValue?.toLocaleString() || 0}
        </span>
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex gap-1">
            {lead.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
