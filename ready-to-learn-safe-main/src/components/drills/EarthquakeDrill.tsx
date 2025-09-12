import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, AlertTriangle, CheckCircle, Mountain } from "lucide-react";

interface EarthquakeDrillProps {
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

interface StoryNode {
  scene_description: string;
  image?: string;
  choices?: Array<{
    text: string;
    outcome: {
      xp: number;
      feedback: string;
      goto: string;
    };
  }>;
  isEnd?: boolean;
}

// --- CORRECTED EARTHQUAKE DRILL STORY DATA ---
const storyData = {
  maxPossibleScore: 110, // Corrected max score
  nodes: {
    START: {
      scene_description: "You're in class when the ground suddenly starts shaking violently. Books are falling, and students are screaming. What's your immediate reaction?",
      image: "/images/drills/earthquake/classroom-shaking.jpg",
      choices: [
        {
          text: "Drop, Cover, and Hold under your desk immediately",
          outcome: { xp: 15, feedback: "Perfect! Drop, Cover, Hold is the correct earthquake response.", goto: "INSIDE_BUILDING" }
        },
        {
          text: "Run outside immediately to escape the building",
          outcome: { xp: -15, feedback: "Dangerous! More injuries occur from falling objects while running during shaking.", goto: "END_FAIL_RUNNING" }
        }
      ]
    },

    INSIDE_BUILDING: {
      scene_description: "The shaking continues violently. Books and objects are crashing down from shelves. The lights are swaying. What do you do while under your desk?",
      image: "/images/drills/earthquake/under-desk.jpg",
      choices: [
        {
          text: "Stay under the desk, protect your head and neck, hold the desk leg",
          outcome: { xp: 20, feedback: "Excellent technique! This protects you from falling debris.", goto: "AFTER_SHAKE" }
        },
        {
          text: "Crawl to stand near the doorway - it's supposedly safer",
          outcome: { xp: -10, feedback: "Doorways aren't safer! This is an outdated myth that causes injuries.", goto: "END_FAIL_DOORWAY" }
        }
      ]
    },

    AFTER_SHAKE: {
      scene_description: "The shaking stops after 45 seconds. Dust is in the air, some ceiling tiles have fallen, and there are cracks in the walls. What's your next step?",
      image: "/images/drills/earthquake/aftermath-classroom.jpg",
      choices: [
        {
          text: "Wait a moment, then carefully assess and move toward the exit",
          outcome: { xp: 15, feedback: "Smart! Pausing to assess prevents rushing into more danger.", goto: "EXIT_ROUTE" }
        },
        {
          text: "Stay seated inside the classroom until help arrives",
          outcome: { xp: -15, feedback: "Dangerous! Aftershocks can cause building collapse. You must evacuate.", goto: "END_FAIL_STAYED" }
        }
      ]
    },

    EXIT_ROUTE: {
      scene_description: "Moving toward the exit, you see significant cracks in the wall, broken glass on the floor, and a ceiling beam that's partially fallen, blocking part of the hallway. How do you proceed?",
      image: "/images/drills/earthquake/damaged-hallway.jpg",
      choices: [
        {
          text: "Walk carefully around obstacles, watching for hazards overhead",
          outcome: { xp: 20, feedback: "Perfect evacuation technique! Being aware of all hazards is crucial.", goto: "INJURED_STUDENT" }
        },
        {
          text: "Run quickly to get out before more things fall",
          outcome: { xp: -15, feedback: "Running blindly through debris causes more injuries than careful movement.", goto: "END_FAIL_DEBRIS" }
        }
      ]
    },

    INJURED_STUDENT: {
      scene_description: "Near the exit, you find a younger student sitting on the floor, holding their arm and crying. They seem hurt and scared. Other students are rushing past them to get outside.",
      image: "/images/drills/earthquake/injured-student.jpg",
      choices: [
        {
          text: "Stop to help them get to safety and alert a teacher",
          outcome: { xp: 25, feedback: "Heroic action! Helping injured people shows true earthquake response leadership.", goto: "ASSEMBLY_AREA_HERO" }
        },
        {
          text: "Keep moving to get yourself to safety first",
          outcome: { xp: 5, feedback: "Self-preservation is understandable, but helping others when safe to do so is important.", goto: "ASSEMBLY_AREA_NORMAL" }
        }
      ]
    },

    ASSEMBLY_AREA_HERO: {
      scene_description: "You carefully help the injured student outside to the designated assembly area. Teachers immediately tend to their injury and thank you. What do you do next in the open area?",
      image: "/images/drills/earthquake/assembly-area.jpg",
      choices: [
        {
          text: "Stay in the center of the open field, away from buildings and power lines",
          outcome: { xp: 15, feedback: "Perfect positioning! You're away from all potential falling hazards.", goto: "AFTERSHOCK_HERO" }
        },
        {
          text: "Stand near a large tree for shade while waiting",
          outcome: { xp: -10, feedback: "Trees can fall in aftershocks! Open ground is safest.", goto: "AFTERSHOCK_NORMAL" }
        }
      ]
    },

    ASSEMBLY_AREA_NORMAL: {
      scene_description: "You reach the outdoor assembly area. Many students are panicking and scattered around. Some are near the building, others under trees. Where do you position yourself?",
      image: "/images/drills/earthquake/assembly-area.jpg",
      choices: [
        {
          text: "Go to the center of the open field, away from any structures",
          outcome: { xp: 15, feedback: "Excellent choice! Open areas are safest during earthquake aftershocks.", goto: "AFTERSHOCK_NORMAL" }
        },
        {
          text: "Stand near the building entrance to wait for friends",
          outcome: { xp: -20, feedback: "Very dangerous! Buildings can collapse in aftershocks.", goto: "END_FAIL_BUILDING" }
        }
      ]
    },

    AFTERSHOCK_HERO: {
      scene_description: "You're in the safe zone when a strong aftershock hits! The ground shakes again. You see some students panicking and running toward the building. What do you do?",
      image: "/images/drills/earthquake/aftershock.jpg",
      choices: [
        {
          text: "Drop to the ground again and call out to others to do the same",
          outcome: { xp: 20, feedback: "Outstanding leadership! You protected yourself and guided others during the aftershock.", goto: "END_SAFE_HERO" }
        },
        {
          text: "Just protect yourself and wait for the shaking to stop",
          outcome: { xp: 10, feedback: "Good self-protection, but helping others would have been even better.", goto: "END_SAFE_NORMAL" }
        }
      ]
    },

    AFTERSHOCK_NORMAL: {
      scene_description: "Teachers announce that everyone should stay calm as aftershocks are expected. They're setting up a safe perimeter. What do you do while waiting?",
      image: "/images/drills/earthquake/waiting-safe.jpg",
      choices: [
        {
          text: "Stay in the open area and follow all safety instructions",
          outcome: { xp: 10, feedback: "Good job following safety protocols during the emergency.", goto: "END_SAFE_NORMAL" }
        },
        {
          text: "Sneak back toward the building to get your phone and backpack",
          outcome: { xp: -25, feedback: "Extremely dangerous! Re-entering damaged buildings causes most earthquake deaths.", goto: "END_FAIL_REENTRY" }
        }
      ]
    },

    // ENDING SCENARIOS
    END_FAIL_RUNNING: { 
      scene_description: "MISSION FAILED: You were hit by falling debris while running during the earthquake. Never run during shaking - Drop, Cover, Hold!", 
      isEnd: true 
    },
    END_FAIL_DOORWAY: { 
      scene_description: "MISSION FAILED: You were injured trying to reach a doorway. Modern doorways offer no special protection - stay under sturdy furniture!", 
      isEnd: true 
    },
    END_FAIL_STAYED: { 
      scene_description: "MISSION FAILED: You were trapped when the building partially collapsed in an aftershock. Always evacuate after earthquake shaking stops!", 
      isEnd: true 
    },
    END_FAIL_DEBRIS: { 
      scene_description: "MISSION FAILED: You tripped on debris and were injured by falling objects. Move carefully during evacuation!", 
      isEnd: true 
    },
    END_FAIL_BUILDING: { 
      scene_description: "MISSION FAILED: You were caught in building collapse during an aftershock. Stay away from all structures after an earthquake!", 
      isEnd: true 
    },
    END_FAIL_REENTRY: { 
      scene_description: "MISSION FAILED: The building collapsed as you tried to retrieve your belongings. Personal items can be replaced - your life cannot!", 
      isEnd: true 
    },
    END_SAFE_NORMAL: { 
      scene_description: "MISSION COMPLETE: You followed earthquake safety procedures and evacuated successfully. Well done!", 
      isEnd: true 
    },
    END_SAFE_HERO: { 
      scene_description: "MISSION COMPLETE: You not only survived the earthquake safely but also helped save others and showed leadership during aftershocks. You are an Earthquake Response Hero!", 
      isEnd: true 
    }
  }
};

const findBestPath = () => {
    const path = [];
    let currentNodeKey = 'START';
    const visited = new Set();

    while(currentNodeKey && !visited.has(currentNodeKey)) {
        visited.add(currentNodeKey);
        const node = storyData.nodes[currentNodeKey];

        if (!node || !node.choices || node.choices.length === 0) {
            path.push({ key: currentNodeKey, choiceText: null });
            break;
        }
        
        const bestChoice = node.choices.reduce((best, current) => 
            ((current.outcome.xp || 0) > (best.outcome.xp || 0)) ? current : best
        );

        path.push({
            key: currentNodeKey,
            choiceText: bestChoice.text
        });

        currentNodeKey = bestChoice.outcome.goto;
        
        if (storyData.nodes[currentNodeKey]?.isEnd) {
            path.push({ key: currentNodeKey, choiceText: null });
            break;
        }
    }
    return path;
};

const OptimalPath = ({ bestPath, userPath }: { bestPath: any[], userPath: string[] }) => {
    return (
        <div className="mt-8 text-left">
            <h3 className="text-xl font-bold text-center text-primary mb-6">Path to a Perfect Score</h3>
            <div className="relative border-l-2 border-border ml-4 pl-6 space-y-8">
                {bestPath.map((step, index) => {
                    const wasOnPath = userPath.includes(step.key);
                    const userPathIndex = userPath.indexOf(step.key);
                    const isLastStep = index === bestPath.length - 1;

                    let madeWrongChoiceHere = false;
                    if(wasOnPath && !isLastStep && userPathIndex < userPath.length - 1){
                        const nextOptimalNodeKey = bestPath[index+1]?.key;
                        const nextUserNodeKey = userPath[userPathIndex+1];
                        if(nextOptimalNodeKey !== nextUserNodeKey){
                            madeWrongChoiceHere = true;
                        }
                    }

                    let statusColor, statusRing;
                    if (madeWrongChoiceHere) {
                        statusColor = 'bg-yellow-500';
                        statusRing = 'ring-yellow-100 dark:ring-yellow-900';
                    } else if (wasOnPath) {
                        statusColor = 'bg-primary';
                         statusRing = 'ring-primary/20';
                    } else {
                        statusColor = 'bg-green-500';
                         statusRing = 'ring-green-100 dark:ring-green-900';
                    }

                    return (
                        <div key={index} className="relative">
                            <div className={`absolute -left-[33px] top-5 w-4 h-4 rounded-full ${statusColor} ring-8 ${statusRing}`}></div>
                            <Card className="p-4">
                               <p className="font-bold text-muted-foreground text-sm">Step {index + 1}: {storyData.nodes[step.key].scene_description.substring(0, 50)}...</p>
                               {step.choiceText ? (
                                    <p className="mt-2 text-foreground">
                                        <span className="font-semibold text-green-600 dark:text-green-400">Optimal Choice:</span> &quot;{step.choiceText}&quot;
                                    </p>
                               ) : (
                                    <p className="mt-2 font-semibold text-green-600 dark:text-green-400">
                                        {storyData.nodes[step.key].scene_description}
                                    </p>
                               )}

                               {madeWrongChoiceHere && (
                                   <Badge variant="secondary" className="mt-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                       You were here, but chose a different path
                                   </Badge>
                               )}
                               {!wasOnPath && (
                                   <Badge variant="secondary" className="mt-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                       You missed this optimal step
                                   </Badge>
                               )}
                            </Card>
                        </div>
                    );
                })}
            </div>
             <Card className="mt-6 p-4 border-muted-foreground/20">
                <h4 className="font-bold mb-2">Legend:</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-primary mr-2 flex-shrink-0"></div> You followed this optimal step</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 flex-shrink-0"></div> You were at this step but made a different choice</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2 flex-shrink-0"></div> You missed this optimal step entirely</div>
                </div>
            </Card>
        </div>
    );
};

const EarthquakeDrill: React.FC<EarthquakeDrillProps> = ({ onComplete, onBack }) => {
  const [drillState, setDrillState] = useState('not_started');
  const [currentNodeKey, setCurrentNodeKey] = useState('START');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [finalScorePercent, setFinalScorePercent] = useState(0);
  const [choiceMade, setChoiceMade] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null);
  const [scenarioCount, setScenarioCount] = useState(1);
  const [userPath, setUserPath] = useState(['START']);

  const currentNode = storyData.nodes[currentNodeKey] as StoryNode;

  const handleChoice = (outcome: any, index: number) => {
    if (choiceMade) return;
    setChoiceMade(true);
    setSelectedChoiceIndex(index);

    const newScore = score + (outcome.xp || 0);
    setScore(newScore);
    setFeedback(outcome.feedback || '');
    
    const nextNodeKey = outcome.goto;
    setUserPath(prevPath => [...prevPath, nextNodeKey]);

    setTimeout(() => {
      setFeedback('');
      const nextNode = storyData.nodes[nextNodeKey];
      if (nextNode && nextNode.isEnd) {
        finishDrill(newScore, nextNodeKey);
      } else {
        setCurrentNodeKey(nextNodeKey);
        setScenarioCount(prev => prev + 1);
        setChoiceMade(false);
        setSelectedChoiceIndex(null);
      }
    }, 2500);
  };

  const finishDrill = (finalScore: number, endNodeKey: string) => {
    let finalPercent = 0;
    if (!endNodeKey.includes('FAIL')) {
        finalPercent = Math.min(100, Math.round((finalScore / storyData.maxPossibleScore) * 100));
    }
    setFinalScorePercent(finalPercent);
    setDrillState('finished');
    setCurrentNodeKey(endNodeKey);
    
    const passed = finalPercent >= 60;
    onComplete(finalPercent, passed);
  };
  
  const startDrill = () => {
      setDrillState('in_progress');
  };

  const resetDrill = () => {
    setDrillState('not_started');
    setCurrentNodeKey('START');
    setScore(0);
    setFeedback('');
    setFinalScorePercent(0);
    setChoiceMade(false);
    setSelectedChoiceIndex(null);
    setScenarioCount(1);
    setUserPath(['START']);
  };

  const getBadge = (percentage: number) => {
      if (percentage >= 95) return { name: "Earthquake Response Champion", color: "text-orange-400", icon: "🏔️" };
      if (percentage >= 80) return { name: "Earthquake Safety Hero", color: "text-yellow-400", icon: "⛰️" };
      if (percentage >= 60) return { name: "Earthquake Responder (Passed)", color: "text-green-400", icon: "🌍" };
      if (percentage > 0) return { name: "Earthquake Safety Trainee", color: "text-gray-400", icon: "📋" };
      return { name: "Needs Earthquake Training", color: "text-red-600", icon: "⚠️" };
  };

  const getChoiceVariant = (xp: number) => {
    if (xp >= 15) return 'default';
    if (xp > 0) return 'secondary';
    return 'destructive';
  };

  const renderStartScreen = () => (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Mountain className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-3xl">Earthquake Response Drill</CardTitle>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master the Drop, Cover, and Hold technique and learn proper earthquake response procedures. 
              Practice life-saving decisions for during and after seismic events.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3">Your Mission:</h3>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Master Drop, Cover, and Hold technique
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Navigate post-earthquake evacuation safely
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Respond appropriately to aftershocks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aim for a score of <span className="font-bold text-foreground">60%</span> or higher to pass
                    </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button onClick={startDrill} size="lg" className="text-lg px-8 bg-orange-600 hover:bg-orange-700">
                Begin Earthquake Drill
              </Button>
              <Button variant="outline" size="lg" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Drills
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );

  const renderResultScreen = () => {
    const passed = finalScorePercent >= 60;
    const badge = getBadge(finalScorePercent);
    const bestPath = findBestPath();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className={`text-3xl ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {currentNode.scene_description.startsWith("MISSION FAILED") ? "Earthquake Drill Failed" : "Earthquake Drill Complete"}
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">{currentNode.scene_description}</p>
            <div className="mt-4">
              <div className="text-2xl font-bold mb-2">Final Score: {finalScorePercent}%</div>
              <Progress value={finalScorePercent} className="w-full max-w-md mx-auto mb-4" />
              <Badge variant="secondary" className={`text-lg px-4 py-2 ${badge.color.replace('text-', 'text-')}`}>
                <span className="mr-2">{badge.icon}</span>
                {badge.name}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {finalScorePercent < 100 && (
                <OptimalPath bestPath={bestPath} userPath={userPath} />
            )}
            
            <div className="text-center mt-8 space-y-4">
                <div className="flex flex-wrap gap-4 justify-center">
                  {!passed ? (
                       <Button onClick={resetDrill} size="lg" className="min-w-32">
                          Try Again
                       </Button>
                  ) : (
                      <Button onClick={resetDrill} variant="outline" size="lg" className="min-w-32">
                          Retake Drill
                      </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={onBack} className="min-w-32">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Drills
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={() => window.location.href = '/dashboard'}
                    className="min-w-32"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    onClick={() => window.location.href = '/progress'}
                    className="min-w-32"
                  >
                    View Progress
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Choose where you'd like to go next, or stay here to review your performance.
                </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDrill = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl text-orange-600 dark:text-orange-400">Earthquake Response Drill</CardTitle>
                          <p className="text-sm text-muted-foreground">Scenario {scenarioCount}</p>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                            Score: <span className="text-primary font-bold ml-1">{score} XP</span>
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className="border-muted">
                        <CardContent className="p-6">
                            <p className="text-lg leading-relaxed text-center mb-4">
                                {currentNode.scene_description}
                            </p>
                            {currentNode.image && (
                                <div className="flex justify-center my-6">
                                    <div className="relative w-full max-w-md mx-auto">
                                        <img 
                                            src={currentNode.image} 
                                            alt="Earthquake scenario illustration"
                                            className="w-full h-48 object-cover rounded-lg shadow-md"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {feedback && (
                        <Card className="border-primary/50 bg-primary/5">
                            <CardContent className="p-4">
                                <p className="font-semibold text-center text-primary">{feedback}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4">
                        {currentNode.choices && currentNode.choices.map((choice, index) => {
                            const isSelected = selectedChoiceIndex === index;
                            let variant = 'outline';
                            let className = '';

                            if (choiceMade) {
                                if (isSelected) {
                                    variant = getChoiceVariant(choice.outcome.xp || 0);
                                    className = 'ring-2 ring-primary';
                                } else {
                                    className = 'opacity-50 cursor-not-allowed';
                                }
                            } else {
                                className = 'hover:bg-accent';
                            }

                            return (
                                <Button
                                    key={index}
                                    onClick={() => handleChoice(choice.outcome, index)}
                                    disabled={choiceMade}
                                    variant={variant as any}
                                    size="lg"
                                    className={`justify-between h-auto p-4 text-left whitespace-normal ${className}`}
                                >
                                    <span className="flex-1">{choice.text}</span>
                                    {isSelected && (
                                        <Badge variant="secondary" className="ml-4">
                                            {choice.outcome.xp >= 0 ? `+${choice.outcome.xp}` : choice.outcome.xp} XP
                                        </Badge>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
 };
  
  const renderContent = () => {
      switch(drillState) {
          case 'not_started':
              return renderStartScreen();
          case 'in_progress':
              return renderDrill();
          case 'finished':
              return renderResultScreen();
          default:
              return renderStartScreen();
      }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {renderContent()}
    </div>
  );
};

export default EarthquakeDrill;