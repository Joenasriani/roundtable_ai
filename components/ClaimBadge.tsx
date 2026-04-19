
import React from 'react';
import { EvidenceLabel } from '../types';

interface Props {
  label: EvidenceLabel;
}

const ClaimBadge: React.FC<Props> = ({ label }) => {
  const styles: Record<EvidenceLabel, string> = {
    'Established Fact': 'bg-blue-100 text-blue-800 border-blue-200',
    'Strong Evidence': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Theoretical Interpretation': 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[label]}`}>
      {label}
    </span>
  );
};

export default ClaimBadge;
