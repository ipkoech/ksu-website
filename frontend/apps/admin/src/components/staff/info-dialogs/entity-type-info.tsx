"use client";

import { InfoButton } from "@/components/ui/info-button";

export function EntityTypeInfo() {
  return (
    <InfoButton title="Organizational Hierarchy">
      <div className="space-y-4">
        <p>Select where this person will be assigned:</p>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Administrative Hierarchy</h4>
          <div className="pl-4 border-l-2 border-primary space-y-2">
            <div>
              <strong>University</strong>
              <p className="text-sm text-muted-foreground">Vice Chancellor</p>
            </div>
            <div>
              <strong>Division</strong> (e.g., ARSA, AP&F)
              <p className="text-sm text-muted-foreground">Deputy Vice Chancellor</p>
            </div>
            <div>
              <strong>Wing</strong> (e.g., Academic, Finance)
              <p className="text-sm text-muted-foreground">Registrar / Finance Officer</p>
            </div>
            <div>
              <strong>Directorate</strong>
              <p className="text-sm text-muted-foreground">Director</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Academic Hierarchy</h4>
          <div className="pl-4 border-l-2 border-green-500 space-y-2">
            <div>
              <strong>School / Faculty</strong>
              <p className="text-sm text-muted-foreground">Dean</p>
            </div>
            <div>
              <strong>Department</strong>
              <p className="text-sm text-muted-foreground">HOD / COD, Lecturers, Staff</p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Governance</h4>
          <div className="pl-4 border-l-2 border-blue-500 space-y-2">
            <div>
              <strong>Board</strong> (Council, Senate, Management)
              <p className="text-sm text-muted-foreground">Chairperson, Secretary, Members</p>
            </div>
            <div>
              <strong>Committee</strong>
              <p className="text-sm text-muted-foreground">Chairperson, Convenor, Members</p>
            </div>
          </div>
        </div>
      </div>
    </InfoButton>
  );
}