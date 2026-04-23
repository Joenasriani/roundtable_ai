
import React from 'react';
import { EvidenceLabel } from '../types';

interface Props {
  label: EvidenceLabel;
}

const ClaimBadge: React.FC<Props> = ({ label }) => {
  const styles: Record<EvidenceLabel, string> = {
    'Established Fact': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Strong Evidence': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Theoretical Interpretation': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[label]}`}>
      {label}
    </span>
  );
};

export default ClaimBadge;
