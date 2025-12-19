import React, { useState } from 'react';

const STAKEHOLDER_CATEGORIES = {
    "System & Structural Factors": [
        { id: 'perpetrator', label: 'Perpetrator', role: 'The Source', type: 'harm' },
        { id: 'enabler', label: 'Silent Enabler', role: 'The Bystander', type: 'harm' },
        { id: 'broken_system', label: 'Broken System', role: 'The Barrier', type: 'harm' },
        { id: 'cultural_stigma', label: 'Cultural Stigma', role: 'The Silence', type: 'harm' },
    ],
    "Core & Family": [
        { id: 'minor', label: 'Child / Minor', role: 'Student / Patient', type: 'help' },
        { id: 'caregiver', label: 'Non-offending Caregiver', role: 'Protector', type: 'help' },
        { id: 'household', label: 'Household Adult', role: 'Relative / Partner', type: 'help' },
        { id: 'sibling', label: 'Sibling / Peer', role: 'Witness / Confidant', type: 'help' },
    ],
    "School & Education": [
        { id: 'teacher', label: 'Teacher', role: 'Classroom / Special Ed', type: 'help' },
        { id: 'counselor', label: 'School Counselor', role: 'Psychologist', type: 'help' },
        { id: 'socialworker_school', label: 'School Social Worker', role: 'Support', type: 'help' },
        { id: 'admin', label: 'Administrator', role: 'Principal / Dean', type: 'help' },
        { id: 'school_nurse', label: 'School Nurse', role: 'Health', type: 'help' },
        { id: 'afterschool', label: 'Program Staff', role: 'Coach / Mentor', type: 'help' },
    ],
    "Medical & Health": [
        { id: 'pediatrician', label: 'Pediatrician', role: 'Primary Care', type: 'help' },
        { id: 'er_clinician', label: 'ER Clinician', role: 'Emergency', type: 'help' },
        { id: 'therapist', label: 'Mental Health Clinician', role: 'Therapist', type: 'help' },
        { id: 'trauma_spec', label: 'Trauma Specialist', role: 'Somatic / CBT', type: 'help' },
        { id: 'forensic_nurse', label: 'Forensic Nurse', role: 'SANE', type: 'help' },
    ],
    "Legal & CPS": [
        { id: 'cps_intake', label: 'CPS Intake', role: 'Screener', type: 'help' },
        { id: 'cps_worker', label: 'CPS Investigator', role: 'Caseworker', type: 'help' },
        { id: 'casa', label: 'CASA / GAL', role: 'Advocate', type: 'help' },
        { id: 'law_enforcement', label: 'Law Enforcement', role: 'SVU / Patrol', type: 'help' },
        { id: 'judge', label: 'Family Judge', role: 'Court', type: 'help' },
        { id: 'attorney', label: 'Attorney', role: 'Public Defender / DA', type: 'help' },
    ],
    "Community & Macro": [
        { id: 'neighbor', label: 'Neighbor / Leader', role: 'Community', type: 'help' },
        { id: 'faith', label: 'Faith Organization', role: 'Support', type: 'help' },
        { id: 'nonprofit', label: 'Child Welfare NGO', role: 'Service', type: 'help' },
        { id: 'researcher', label: 'Researcher', role: 'Data / Policy', type: 'help' },
        { id: 'policymaker', label: 'Policy Maker', role: 'State / Gov', type: 'help' },
    ]
};

const FLOWS = {
    harm: [
        { title: "Grooming", desc: "Building false trust" },
        { title: "Exploitation", desc: "Abuse of power" },
        { title: "Suppression", desc: "Enforcing silence" },
    ],
    help: [
        { title: "Recognition", desc: "Seeing the signs" },
        { title: "Connection", desc: "Building trust" },
        { title: "Action", desc: "Mobilizing support" },
    ]
};

const RoomGrowth = ({ isActive }) => {
    const [placedHarm, setPlacedHarm] = useState(Array(3).fill(null));
    const [placedHelp, setPlacedHelp] = useState(Array(3).fill(null));
    // particular items used from the pool
    const [usedIds, setUsedIds] = useState(new Set());
    const [selectedStakeholder, setSelectedStakeholder] = useState(null);

    const handleSelectStakeholder = (stakeholder) => {
        if (usedIds.has(stakeholder.id)) return;
        setSelectedStakeholder(stakeholder);
    };

    const handlePlaceInSlot = (flowType, index) => {
        if (!selectedStakeholder) return;

        if (flowType === 'harm') {
            const newPlaced = [...placedHarm];
            newPlaced[index] = selectedStakeholder;
            setPlacedHarm(newPlaced);
        } else {
            const newPlaced = [...placedHelp];
            newPlaced[index] = selectedStakeholder;
            setPlacedHelp(newPlaced);
        }

        setUsedIds(prev => new Set(prev).add(selectedStakeholder.id));
        setSelectedStakeholder(null); // Deselect after placement
    };

    const handleReset = () => {
        setPlacedHarm(Array(3).fill(null));
        setPlacedHelp(Array(3).fill(null));
        setUsedIds(new Set());
        setSelectedStakeholder(null);
    };

    const isHarmComplete = placedHarm.every(item => item !== null);
    const isHelpComplete = placedHelp.every(item => item !== null);
    const isComplete = isHarmComplete && isHelpComplete;

    return (
        <div className={`room-content`} style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            color: '#fff',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? 'auto' : 'none',
            transition: 'opacity 1s ease-in-out',
            zIndex: 10,
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '2%', textAlign: 'center', width: '100%' }}>
                <h1 style={{ fontFamily: 'Impact, sans-serif', fontSize: '2.5rem', margin: '0 0 5px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Systemic Link
                </h1>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Select a stakeholder, then assign them to a path.
                </p>
            </div>

            <div style={{ display: 'flex', width: '95%', maxWidth: '1400px', height: '80%', gap: '20px', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>

                {/* Left Panel: Stakeholders (Categorized Scrollable) */}
                <div style={{
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '15px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '15px',
                    border: '1px solid #333',
                    height: '85%',
                    overflowY: 'auto'
                }}>
                    <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '10px', color: '#00ccff', fontSize: '1rem' }}>
                        Stakeholders
                        {selectedStakeholder && <span style={{ fontSize: '0.7rem', color: '#fff', marginLeft: '10px', fontStyle: 'italic' }}>(Selected: {selectedStakeholder.label})</span>}
                    </h3>

                    {Object.entries(STAKEHOLDER_CATEGORIES).map(([category, items]) => (
                        <div key={category} style={{ marginBottom: '10px' }}>
                            <h4 style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>{category}</h4>
                            {items.map(s => {
                                const isUsed = usedIds.has(s.id);
                                const isSelected = selectedStakeholder?.id === s.id;
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => !isUsed && handleSelectStakeholder(s)}
                                        style={{
                                            padding: '8px',
                                            marginBottom: '5px',
                                            background: isSelected ? 'rgba(0, 204, 255, 0.3)' : (isUsed ? 'rgba(0,0,0,0.3)' : 'rgba(255, 255, 255, 0.05)'),
                                            border: isSelected ? '1px solid #00ccff' : (isUsed ? '1px solid #333' : '1px solid #555'),
                                            borderRadius: '6px',
                                            cursor: isUsed ? 'default' : 'pointer',
                                            opacity: isUsed ? 0.5 : 1,
                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                            transition: 'all 0.2s',
                                            userSelect: 'none'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isUsed && !isSelected) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isUsed && !isSelected) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            }
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{s.label}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#ccc' }}>{s.role}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Right Panel: Dual Workflows */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    height: '100%',
                    justifyContent: 'center'
                }}>

                    {/* HARM FLOW (Top) */}
                    <div style={{ position: 'relative', padding: '20px', border: '1px solid #550000', borderRadius: '10px', background: 'rgba(50,0,0,0.2)' }}>
                        <h4 style={{ position: 'absolute', top: '-10px', left: '20px', background: '#000', padding: '0 10px', color: '#ff3333' }}>PATH OF HARM</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                            {/* Line */}
                            <div style={{ position: 'absolute', width: '80%', height: '2px', background: '#550000', zIndex: 0 }}></div>

                            {FLOWS.harm.map((slot, i) => (
                                <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#ff8888', marginBottom: '10px' }}>{slot.title}</div>
                                    <div
                                        onClick={() => handlePlaceInSlot('harm', i)}
                                        style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: placedHarm[i] ? '#220000' : (selectedStakeholder ? 'rgba(255, 50, 50, 0.1)' : '#111'),
                                            border: placedHarm[i] ? '2px solid #ff3333' : (selectedStakeholder ? '2px dashed #ff3333' : '2px dashed #550000'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                                            cursor: selectedStakeholder && !placedHarm[i] ? 'pointer' : 'default',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedStakeholder && !placedHarm[i] ? '0 0 10px rgba(255, 50, 50, 0.3)' : 'none'
                                        }}>
                                        {placedHarm[i] ? (
                                            <div style={{ width: '100%', padding: '5px' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#ff3333', fontWeight: 'bold', lineHeight: '1.1' }}>{placedHarm[i].label}</div>
                                            </div>
                                        ) : <span style={{ color: selectedStakeholder ? '#ff3333' : '#330000', fontSize: '1.5rem', opacity: selectedStakeholder ? 1 : 0.3 }}>+</span>}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px' }}>{slot.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HELP FLOW (Bottom) */}
                    <div style={{ position: 'relative', padding: '20px', border: '1px solid #005500', borderRadius: '10px', background: 'rgba(0,50,0,0.2)' }}>
                        <h4 style={{ position: 'absolute', top: '-10px', left: '20px', background: '#000', padding: '0 10px', color: '#00ffaa' }}>PATH OF HEALING</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                            {/* Line */}
                            <div style={{ position: 'absolute', width: '80%', height: '2px', background: '#005500', zIndex: 0 }}></div>

                            {FLOWS.help.map((slot, i) => (
                                <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#88ff88', marginBottom: '10px' }}>{slot.title}</div>
                                    <div
                                        onClick={() => handlePlaceInSlot('help', i)}
                                        style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: placedHelp[i] ? '#002200' : (selectedStakeholder ? 'rgba(0, 200, 100, 0.1)' : '#111'),
                                            border: placedHelp[i] ? '2px solid #00ffaa' : (selectedStakeholder ? '2px dashed #00ffaa' : '2px dashed #005500'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                                            cursor: selectedStakeholder && !placedHelp[i] ? 'pointer' : 'default',
                                            transition: 'all 0.2s',
                                            boxShadow: selectedStakeholder && !placedHelp[i] ? '0 0 10px rgba(0, 200, 100, 0.3)' : 'none'
                                        }}>
                                        {placedHelp[i] ? (
                                            <div style={{ width: '100%', padding: '5px' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#00ffaa', fontWeight: 'bold', lineHeight: '1.1' }}>{placedHelp[i].label}</div>
                                            </div>
                                        ) : <span style={{ color: selectedStakeholder ? '#00ffaa' : '#003300', fontSize: '1.5rem', opacity: selectedStakeholder ? 1 : 0.3 }}>+</span>}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px' }}>{slot.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {isComplete && (
                <div style={{
                    position: 'absolute',
                    bottom: '150px',
                    textAlign: 'center',
                    animation: 'fadeIn 1s forwards',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid #444'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>
                        Understanding the PATH allows us to BREAK the cycle
                    </h2>
                    <button
                        onClick={handleReset}
                        style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#888',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        Reset Map
                    </button>
                    <style>
                        {`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}
                    </style>
                </div>
            )}
        </div>
    );
};

export default RoomGrowth;
