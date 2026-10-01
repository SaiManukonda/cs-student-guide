// Rules checked against the official program catalogs on October 1, 2026.
// Sources remain attached to each school's planner and each Georgia Tech pair.
export const cs=(values:string)=>values.split(' ').map(n=>'CS '+n);
export const uiucFocus:Record<string,string[]>={
 'Software foundations':cs('407 409 422 426 427 428 429 474 476 477 492 493 494'),
 'Algorithms and computation':cs('407 413 473 474 475 476 477 481 482'),
 'Intelligence and big data':cs('410 411 412 414 416 434 440 441 442 443 444 445 446 447 448 464 466 467 469 470'),
 'Human and social impact':cs('409 415 416 417 441 442 460 461 463 464 465 467 468 469 470'),
 'Media':cs('409 414 415 416 417 418 419 445 448 465 467 468 469'),
 'Scientific and parallel computing':cs('419 435 450 466 482 483 484'),
 'Distributed systems, networking and security':cs('407 423 424 425 431 435 436 437 438 439 460 461 463 483 484'),
 'Machines':cs('423 424 426 431 433 434 437 484'),
};
export const uiucTeam=cs('411 415 417 425 427 428 429 437 465 467 493 494 497');
export const vtCore=cs('1114 1944 2104 2114 2505 2506 3114 3214 3304 3604 4944');
export const vtTheory=cs('4104 4114 4124 4134 5104 5114');
export const vtCapstone=cs('4094 4274 4284 4624 4634 4644 4664 4704 4784 4884');
export const vtExcluded=cs('3634 5040 5044 5045 5046 5644 5664 5904 5944 5974 5994');
