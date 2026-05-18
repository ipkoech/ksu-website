"use client";

import { InfoButton } from "@/components/ui/info-button";

export function MemberRoleInfo() {
  return (
    <InfoButton title="Board Member Roles Explained">
      <div className="space-y-4">
        <p>Each board/committee has specific roles for its members:</p>

        <div className="space-y-3">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Chairperson</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>Presides over meetings</li>
              <li>Casts deciding vote in case of ties</li>
              <li>Only ONE per board</li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Vice Chairperson</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>Acts as Chair when Chairperson is absent</li>
              <li>Supports the Chairperson&apos;s duties</li>
              <li>Only ONE per board</li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Secretary</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>Records minutes and maintains records</li>
              <li>Manages correspondence and scheduling</li>
              <li>Usually the Registrar or designated officer</li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Member</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>Regular voting member</li>
              <li>Participates in discussions and decisions</li>
              <li>Multiple members allowed</li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Ex-Officio</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>Member by virtue of their position</li>
              <li>Term tied to their substantive position</li>
              <li>E.g., VC is ex-officio member of Senate</li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold">Student Rep / Staff Rep</h4>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>Represents student/staff constituency</li>
              <li>Usually elected by their peers</li>
              <li>Shorter terms (typically 1 year)</li>
            </ul>
          </div>
        </div>
      </div>
    </InfoButton>
  );
}