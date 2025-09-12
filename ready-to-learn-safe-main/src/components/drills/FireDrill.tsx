import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, Trophy, AlertTriangle, CheckCircle, Flame } from "lucide-react";

interface FireDrillProps {
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

interface StoryNode {
  scene_description: string;
  image?: string; // Optional image path
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

// --- CORRECTED FIRE DRILL STORY DATA ---
const storyData = {
  maxPossibleScore: 115, // Corrected max score
  nodes: {
    START: {
      scene_description: "It's a regular day at school. Suddenly, the fire alarm blares loudly. Students look around in confusion. What do you do first?",
      image: "/images/drills/fire/fire-alarm.jpg",
      choices: [
        {
          text: "Stay calm and get ready to evacuate",
          outcome: { xp: 10, feedback: "Good move. Panic can make the situation worse.", goto: "CHECK_DOOR" }
        },
        {
          text: "Ignore the alarm and continue sitting",
          outcome: { xp: -10, feedback: "Ignoring alarms can be very dangerous. Fire alarms are never to be ignored.", goto: "END_FAIL_IGNORED" }
        }
      ]
    },

    CHECK_DOOR: {
      scene_description: "You get up and prepare to leave. There's smoke visible in the corridor through the window. What should you do before opening the classroom door?",
      image: "/images/drills/fire/check-door.jpg",
      choices: [
        {
          text: "Check if the door handle is hot with the back of your hand before opening",
          outcome: { xp: 15, feedback: "Smart! A hot door means fire may be close by. This could save your life.", goto: "EXIT_HALLWAY" }
        },
        {
          text: "Open the door immediately without checking",
          outcome: { xp: -15, feedback: "Dangerous! Flames or superheated gases could rush in. Always check doors first.", goto: "END_FAIL_DOOR" }
        }
      ]
    },

    EXIT_HALLWAY: {
      scene_description: "The door handle is cool - safe to open. The hallway has light smoke near the ceiling. Students start rushing toward the exit. What will you do?",
      image: "/images/drills/fire/smoky-hallway.jpg",
      choices: [
        {
          text: "Stay low (crawl or duck-walk) and move quickly toward the exit",
          outcome: { xp: 20, feedback: "Excellent! Staying low reduces smoke inhalation. Clean air is near the floor.", goto: "HELP_STUDENT" }
        },
        {
          text: "Run standing upright through the smoke",
          outcome: { xp: -15, feedback: "Very dangerous. You'll breathe toxic smoke and hot gases that can damage your lungs.", goto: "END_FAIL_SMOKE" }
        }
      ]
    },

    HELP_STUDENT: {
      scene_description: "Moving low through the hallway, you notice a younger student frozen in fear near a classroom door, crying and not moving. Other students are passing by. What do you do?",
      image: "/images/drills/fire/scared-student.jpg",
      choices: [
        {
          text: "Quickly guide them and encourage them to follow you to safety",
          outcome: { xp: 20, feedback: "Excellent heroic action! Helping others while keeping everyone safe shows true leadership.", goto: "STAIRS_HERO" }
        },
        {
          text: "Keep moving - you need to get yourself to safety first",
          outcome: { xp: 5, feedback: "Understandable self-preservation, but helping others when possible is important too.", goto: "STAIRS_NORMAL" }
        }
      ]
    },

    STAIRS_HERO: {
      scene_description: "You're helping the younger student toward the stairwell. You reach the stairs with the student following you. An elevator nearby has its doors open. Which will you choose?",
      image: "/images/drills/fire/stairs-elevator.jpg",
      choices: [
        {
          text: "Take the stairs with the student",
          outcome: { xp: 15, feedback: "Perfect choice! Elevators can malfunction, trap you, or take you to the fire floor.", goto: "EXIT_DOOR_HERO" }
        },
        {
          text: "Use the elevator - it's faster with the scared student",
          outcome: { xp: -25, feedback: "Fatal mistake! Elevators are death traps in fires. They can stop at fire floors or lose power.", goto: "END_FAIL_ELEVATOR" }
        }
      ]
    },

    STAIRS_NORMAL: {
      scene_description: "You reach the stairwell alone. An elevator nearby has its doors open and some students are getting in. Which will you choose?",
      image: "/images/drills/fire/stairs-elevator.jpg",
      choices: [
        {
          text: "Take the stairs",
          outcome: { xp: 15, feedback: "Correct! Elevators can stop working in fires or take you to dangerous floors.", goto: "EXIT_DOOR_NORMAL" }
        },
        {
          text: "Use the elevator",
          outcome: { xp: -25, feedback: "Wrong choice! Elevators are extremely unsafe during fires and can become deadly traps.", goto: "END_FAIL_ELEVATOR" }
        }
      ]
    },

    EXIT_DOOR_HERO: {
      scene_description: "You and the student you helped reach the ground floor exit safely. The doorway is crowded with students trying to get out. What's the safest action?",
      image: "/images/drills/fire/crowded-exit.jpg",
      choices: [
        {
          text: "Keep the student close and move calmly, avoiding pushing",
          outcome: { xp: 20, feedback: "Perfect leadership! Staying calm prevents stampedes and keeps everyone safer.", goto: "ASSEMBLY_HERO" }
        },
        {
          text: "Push through with the student to get out faster",
          outcome: { xp: -10, feedback: "Dangerous! This could cause panic and injuries. The student could get hurt.", goto: "EXIT_DOOR_NORMAL" }
        }
      ]
    },

    EXIT_DOOR_NORMAL: {
      scene_description: "You reach the ground floor exit. The doorway is crowded with students. What's the safest action?",
      image: "/images/drills/fire/crowded-exit.jpg",
      choices: [
        {
          text: "Move calmly and avoid pushing",
          outcome: { xp: 15, feedback: "Good choice. Calm exits prevent stampedes and injuries.", goto: "ASSEMBLY_NORMAL" }
        },
        {
          text: "Push through to get out faster",
          outcome: { xp: -15, feedback: "This panic behavior can injure others and cause dangerous crowd crushes.", goto: "END_FAIL_STAMPEDE" }
        }
      ]
    },

    ASSEMBLY_HERO: {
      scene_description: "You exit the building safely with the student you helped. Teachers are directing everyone to the assembly point on the field. The student you helped thanks you. What do you do?",
      image: "/images/drills/fire/assembly-point.jpg",
      choices: [
        {
          text: "Make sure the student finds their class, then join your own class group for roll call",
          outcome: { xp: 15, feedback: "Outstanding! You completed your heroic rescue and followed proper procedure.", goto: "END_SAFE_HERO" }
        },
        {
          text: "Leave the student and quickly find your friends",
          outcome: { xp: -5, feedback: "You helped well but should have made sure they were fully safe with their class.", goto: "END_SAFE_NORMAL" }
        }
      ]
    },

    ASSEMBLY_NORMAL: {
      scene_description: "You exit the building safely. Teachers are guiding everyone to the assembly point on the field. What do you do?",
      image: "/images/drills/fire/assembly-point.jpg",
      choices: [
        {
          text: "Join your class group immediately and wait for roll call",
          outcome: { xp: 10, feedback: "Good job! Roll call ensures everyone is accounted for and safe.", goto: "END_SAFE_NORMAL" }
        },
        {
          text: "Wander around to find friends and call family",
          outcome: { xp: -15, feedback: "Bad idea! You might be marked missing, causing panic and wasting emergency resources.", goto: "END_FAIL_MISSING" }
        }
      ]
    },

    // ENDING SCENARIOS
    END_FAIL_IGNORED: { 
      scene_description: "MISSION FAILED: You ignored the fire alarm. In a real fire, this could cost you your life. Fire alarms must always be taken seriously.", 
      isEnd: true 
    },
    END_FAIL_DOOR: { 
      scene_description: "MISSION FAILED: You opened a hot door and were engulfed by flames and superheated gases. Always check doors before opening in a fire.", 
      isEnd: true 
    },
    END_FAIL_SMOKE: { 
      scene_description: "MISSION FAILED: You inhaled toxic smoke by staying upright. Smoke inhalation is the leading cause of fire deaths. Stay low!", 
      isEnd: true 
    },
    END_FAIL_ELEVATOR: { 
      scene_description: "MISSION FAILED: The elevator stopped at the fire floor and you were trapped. Never use elevators during fires!", 
      isEnd: true 
    },
    END_FAIL_STAMPEDE: { 
      scene_description: "MISSION FAILED: Your pushing caused a stampede that injured others. Panic kills - stay calm during evacuations.", 
      isEnd: true 
    },
    END_FAIL_MISSING: { 
      scene_description: "MISSION FAILED: You were marked missing and emergency responders wasted time searching for you. Always report to your assembly point.", 
      isEnd: true 
    },
    END_SAFE_NORMAL: { 
      scene_description: "MISSION COMPLETE: You evacuated safely following proper fire safety procedures. Well done!", 
      isEnd: true 
    },
    END_SAFE_HERO: { 
      scene_description: "MISSION COMPLETE: You not only evacuated safely but also saved another student's life! You are a Fire Safety Hero! Your quick thinking and courage made the difference.", 
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

const FireDrill: React.FC<FireDrillProps> = ({ onComplete, onBack }) => {
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
    
    // Notify parent component
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
      if (percentage >= 95) return { name: "Fire Safety Champion", color: "text-red-400", icon: "🚒" };
      if (percentage >= 80) return { name: "Fire Safety Hero", color: "text-orange-400", icon: "🔥" };
      if (percentage >= 60) return { name: "Fire Safety Responder (Passed)", color: "text-yellow-400", icon: "🚨" };
      if (percentage > 0) return { name: "Fire Safety Trainee", color: "text-gray-400", icon: "⚠️" };
      return { name: "Needs Fire Safety Training", color: "text-red-600", icon: "🆘" };
  };

  const getChoiceVariant = (xp: number) => {
    if (xp >= 15) return 'default'; // Best choice
    if (xp > 0) return 'secondary'; // Good choice
    return 'destructive'; // Poor choice
  };

  const renderStartScreen = () => (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Flame className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-3xl">Fire Safety Drill</CardTitle>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This virtual simulation will test your fire evacuation knowledge and decision-making skills. 
              Learn proper fire safety procedures and emergency response techniques.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">Your Mission:</h3>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Learn and apply proper fire evacuation procedures
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Make quick, safe decisions under pressure
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Help others while ensuring your own safety
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aim for a score of <span className="font-bold text-foreground">60%</span> or higher to pass
                    </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button onClick={startDrill} size="lg" className="text-lg px-8 bg-red-600 hover:bg-red-700">
                Begin Fire Safety Drill
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
                {currentNode.scene_description.startsWith("MISSION FAILED") ? "Fire Drill Failed" : "Fire Drill Complete"}
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
                          <CardTitle className="text-xl text-red-600 dark:text-red-400">Fire Safety Drill</CardTitle>
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
                                            alt="Fire scenario illustration"
                                            className="w-full h-48 object-cover rounded-lg shadow-md"
                                            onError={(e) => {
                                                // Hide image if it fails to load
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

export default FireDrill;