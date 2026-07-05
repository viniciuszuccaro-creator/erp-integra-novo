/**
 * CadastrosPageLayout — layout para página de Cadastro Gerais
 * Organiza grupos, contagens, e tabelas de forma responsiva e fluida
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import CadastrosTableUniversal from "./CadastrosTableUniversal";
import CadastrosGroupCountBadge from "./CadastrosGroupCountBadge";
import CountBadgeSimplificado from "./CountBadgeSimplificado";
import { CADASTROS_GROUPS, CADASTROS_ENTITIES, getGroupEntities } from "./CadastrosConfig";

export default function CadastrosPageLayout() {
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  return (
    <div className="space-y-6 w-full h-full">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Cadastros Gerais</h1>
        <p className="text-slate-600">Gerencie dados mestres do seu negócio de forma ágil e eficiente</p>
      </div>

      {selectedEntity ? (
        // Mode: Entity Details (Table)
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntity(null)}
                className="text-slate-600 hover:bg-slate-100 rounded-sm"
              >
                ← Voltar
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">
                {CADASTROS_ENTITIES[selectedEntity]?.label || selectedEntity}
              </h2>
              <Badge variant="outline" className="text-xs rounded-sm">
                <CountBadgeSimplificado entities={[selectedEntity]} />
              </Badge>
            </div>
            <Button className="gap-2 rounded-sm">
              <Plus className="w-4 h-4" />
              Novo
            </Button>
          </div>

          <CadastrosTableUniversal
            entityName={selectedEntity}
            columns={CADASTROS_ENTITIES[selectedEntity]?.columns || []}
            pageSize={20}
          />
        </div>
      ) : (
        // Mode: Groups Overview
        <div className="grid grid-cols-1 gap-4">
          {CADASTROS_GROUPS.map((group) => {
            const isExpanded = expandedGroup === group.name;
            const entities = getGroupEntities(group.name);
            const IconComponent = group.icon;

            return (
              <Card key={group.name} className="rounded-sm border-slate-200 overflow-hidden">
                <CardHeader
                  className="p-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  onClick={() => setExpandedGroup(isExpanded ? null : group.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-slate-600" />
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {group.name}
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1">{group.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs rounded-sm bg-slate-50">
                        <CadastrosGroupCountBadge groupName={group.name} />
                      </Badge>
                      <span className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-0 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                      {entities.map((entityName) => {
                        const config = CADASTROS_ENTITIES[entityName];
                        const EntityIcon = config?.icon || Plus;
                        return (
                          <button
                            key={entityName}
                            onClick={() => setSelectedEntity(entityName)}
                            className="p-3 text-left rounded-sm border border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                  {config?.label || entityName}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  <CountBadgeSimplificado entities={[entityName]} />
                                </div>
                              </div>
                              <EntityIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}