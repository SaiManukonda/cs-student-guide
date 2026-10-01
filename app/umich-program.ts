import rules from './umich-rules.json';
export const michiganMath=[
 ['MATH 115','MATH 120','MATH 185','MATH 295'],
 ['MATH 116','MATH 121','MATH 156','MATH 186','MATH 276','MATH 296'],
 ['MATH 214','MATH 217','MATH 417','MATH 419','EECS 245'],
 ['MATH 205','MATH 215','MATH 285'],
 ['MATH 216','MATH 286','MATH 316']
];
export const michiganCore=[['EECS 203','MATH 465','MATH 565'],['EECS 280'],['EECS 281'],['EECS 370'],['EECS 376'],rules.stats];
export const michiganEngineeringCore=[...michiganCore,['ENGR 100'],['ENGR 101','ENGR 151','EECS 180','EECS 183','ROB 102'],...['140','141','240','241'].map(n=>['PHYSICS '+n]),michiganMath[0],michiganMath[1],[...michiganMath[2],'ROB 101'],[...michiganMath[3],...michiganMath[4]],['EECS 295','EECS 496','ENGR 499-002','COMPFOR 111','CSE 543','COMM 349'],['TCHNCLCM 497']];
export const michiganProgram={degree:'Computer Science · Choose LSA or Engineering',credits:120,source:rules.sources.lsa,scope:'University of Michigan–Ann Arbor, 2026–27 CS program guides. Choose LSA or Engineering to calculate the corresponding requirements. Special topics, thesis approval, transfer equivalencies and prior catalog years need advisor review.',core:michiganCore,checks:[] as [string,string][],extra:[] as [string,string,number][]};
