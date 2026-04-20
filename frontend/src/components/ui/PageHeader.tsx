'use client';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumb?: string[];
}

export default function PageHeader({ title, subtitle, action, breadcrumb }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 28, flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {breadcrumb && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {crumb}
                </span>
                {i < breadcrumb.length - 1 && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>/</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 400 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
