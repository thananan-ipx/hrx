"use client"

import React, { useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { OrgChart } from "d3-org-chart"
import { Department } from "@/types/department"

type ChartNode = { data: any }
type MinimalOrgChart = {
  container: (el: HTMLDivElement) => MinimalOrgChart;
  data: (data: any[]) => MinimalOrgChart;
  nodeHeight: (fn: (d: ChartNode) => number) => MinimalOrgChart;
  nodeWidth: (fn: (d: ChartNode) => number) => MinimalOrgChart;
  childrenMargin: (fn: (d: ChartNode) => number) => MinimalOrgChart;
  compact: (v: boolean) => MinimalOrgChart;
  nodeContent: (fn: (d: ChartNode) => string) => MinimalOrgChart;
  render: () => MinimalOrgChart;
};

export function DepartmentOrgChart({ departments }: { departments: Department[] }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<MinimalOrgChart | null>(null)
  const router = useRouter()

  const chartData = useMemo(() => {
    const activeDepts = departments.filter(d => (d as any).is_active !== false);
    
    const formattedData = activeDepts.map(dept => ({
      ...dept,
      id: String(dept.id),
      parentId: dept.parent_department_id ? String(dept.parent_department_id) : "org-root",
    }));

    formattedData.push({
      id: "org-root",
      parentId: "",
      name: "ไอโปรเกรสเอ็กซ์",
      manager: null,
      isVirtualRoot: true,
    } as any);

    return formattedData;
  }, [departments]);

  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      chartInstance.current ??= (new OrgChart() as unknown as MinimalOrgChart);
      
      chartInstance.current
        .container(chartRef.current)
        .data(chartData)
        .nodeHeight(() => 110)
        .nodeWidth(() => 240)
        .childrenMargin(() => 40)
        .compact(false)
        .nodeContent((d: ChartNode) => {
          const dept = d.data;

          if (dept.isVirtualRoot) {
            return `
              <div style="width: 240px; height: 110px; display: flex; align-items: center; justify-content: center; background: linear-to-br, #2563EB, #1D4ED8; background-color: #2563EB; color: white; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);">
                🏢 ${dept.name}
              </div>
            `;
          }

          const managerName = dept.manager 
            ? `${dept.manager.first_name} ${dept.manager.last_name}` 
            : "<span style='font-style: italic; opacity: 0.5;'>ยังไม่ระบุหัวหน้า</span>";

          return `
            <div 
              data-dept-id="${dept.id}"
              style="width: 240px; height: 110px; background-color: #ffffff; border: 2px solid #BFDBFE; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05); cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s; box-sizing: border-box;"
              onmouseover="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 10px 15px -3px rgba(59, 130, 246, 0.2)'; this.style.transform='translateY(-2px)';"
              onmouseout="this.style.borderColor='#BFDBFE'; this.style.boxShadow='0 1px 3px 0 rgba(0,0,0,0.05)'; this.style.transform='translateY(0)';"
              onclick="window.dispatchEvent(new CustomEvent('orgchart-node-click', { detail: '${dept.id}' }))"
            >
              <div style="font-weight: 700; font-size: 15px; color: #1D4ED8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; justify-content: space-between;">
                <span style="overflow: hidden; text-overflow: ellipsis;">${dept.name}</span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 10px; background-color: #F8FAFC; padding: 8px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; border: 1px solid #CBD5E1; flex-shrink: 0;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div style="display: flex; flex-direction: column; overflow: hidden;">
                  <span style="font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: 600; line-height: 1;">Manager</span>
                  <span style="font-size: 12px; font-weight: 600; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; margin-top: 2px;">
                    ${managerName}
                  </span>
                </div>
              </div>
            </div>
          `;
        })
        .render();

      // const clickHandler = (e: Event) => {
      //   const deptId = (e as CustomEvent<string>).detail;
      //   if (deptId && deptId !== "org-root") {
      //     router.push(`/employees?department=${deptId}`);
      //   }
      // };

      // window.addEventListener("orgchart-node-click", clickHandler);

      // return () => {
      //   window.removeEventListener("orgchart-node-click", clickHandler);
      // };
    }
  }, [chartData, router]);

  if (departments.length === 0) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
        <p>ไม่พบข้อมูลโครงสร้างองค์กร</p>
      </div>
    );
  }

  return (
    <div className="relative h-[650px] w-full rounded-xl border bg-slate-50 overflow-hidden shadow-inner">
      <style jsx global>{`
        .svg-chart-container path.link {
          stroke: #3B82F6 !important;
          stroke-width: 2.5px !important;
          stroke-opacity: 0.6;
        }
      `}</style>
      
      <div ref={chartRef} className="h-full w-full" />
    </div>
  );
}