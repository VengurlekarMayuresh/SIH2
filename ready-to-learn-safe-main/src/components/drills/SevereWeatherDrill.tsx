import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, AlertTriangle, CheckCircle, Cloud } from "lucide-react";

interface SevereWeatherDrillProps {
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

// --- ENHANCED SEVERE WEATHER DRILL STORY DATA ---
const storyData = {
  maxPossibleScore: 125, // Corrected max score
  nodes: {
    START: {
      scene_description: "Weather alerts are buzzing on your phone! Dark clouds gather rapidly, strong winds shake the windows, and the weather service announces a severe storm warning with potential for dangerous winds and flooding. What's your immediate response?",
      image: "/images/drills/weather/storm-warning.jpg",
      choices: [
        {
          text: "Immediately secure all windows and doors, then check emergency supplies",
          outcome: {
            xp: 15,
            feedback: "Excellent preparation! Securing your home is the first priority in severe weather.",
            goto: "SUPPLIES"
          }
        },
        {
          text: "Go outside to watch the storm develop - it looks amazing",
          outcome: {
            xp: -25,
            feedback: "Extremely dangerous! Flying debris and lightning strikes kill people during storms.",
            goto: "END_FAIL_OUTSIDE"
          }
        }
      ]
    },

    SUPPLIES: {
      scene_description: "The power flickers ominously and you hear the wind getting stronger. Your family asks you to help gather emergency supplies before conditions worsen. What do you prioritize?",
      image: "/images/drills/weather/gathering-supplies.jpg",
      choices: [
        {
          text: "Flashlights, battery radio, bottled water, non-perishable food, first-aid kit, and medications",
          outcome: {
            xp: 25,
            feedback: "Outstanding preparation! You've gathered all essential survival supplies for extended power outages.",
            goto: "SHELTER_LOCATION"
          }
        },
        {
          text: "Just grab some snacks and charge your phone - the power will probably come back soon",
          outcome: {
            xp: -15,
            feedback: "Poor planning! Storms can leave you without power for days. Proper supplies save lives.",
            goto: "SHELTER_LOCATION"
          }
        }
      ]
    },

    SHELTER_LOCATION: {
      scene_description: "The storm is intensifying rapidly outside. You can hear objects hitting the house and the wind is howling. Your family needs to choose the safest room to shelter in. Which do you recommend?",
      image: "/images/drills/weather/choosing-shelter.jpg",
      choices: [
        {
          text: "Interior bathroom or closet on the lowest floor, away from windows and large roof spans",
          outcome: {
            xp: 25,
            feedback: "Perfect choice! Interior rooms on lower floors with small spans are the safest during severe storms.",
            goto: "DURING_STORM"
          }
        },
        {
          text: "Living room with large windows so you can monitor the storm's progress",
          outcome: {
            xp: -20,
            feedback: "Very dangerous! Windows can explode inward from pressure changes and flying debris.",
            goto: "END_FAIL_WINDOWS"
          }
        }
      ]
    },

    DURING_STORM: {
      scene_description: "You're sheltering safely when the storm reaches peak intensity. The wind is deafening, you hear crashes and breaking glass outside, and the power goes out completely. Your younger sibling is getting scared. What do you do?",
      image: "/images/drills/weather/during-storm.jpg",
      choices: [
        {
          text: "Stay calm, comfort your sibling, monitor weather radio, and keep everyone in the safe room",
          outcome: {
            xp: 20,
            feedback: "Excellent leadership! Staying calm and keeping others safe shows true emergency preparedness.",
            goto: "STORM_DECISION"
          }
        },
        {
          text: "Peek outside through a window to see what's causing all the noise",
          outcome: {
            xp: -15,
            feedback: "Risky behavior! Opening doors or getting near windows during peak storm conditions is dangerous.",
            goto: "STORM_DECISION"
          }
        }
      ]
    },

    STORM_DECISION: {
      scene_description: "The storm continues for hours. You hear your neighbor's car alarm going off and what sounds like someone calling for help outside. The wind is still strong but seems to be lessening. What do you decide?",
      image: "/images/drills/weather/neighbor-help.jpg",
      choices: [
        {
          text: "Wait for the storm to completely pass, then safely check on neighbors with proper precautions",
          outcome: {
            xp: 25,
            feedback: "Smart decision! Never venture out during active severe weather, even to help others.",
            goto: "AFTERMATH_HERO"
          }
        },
        {
          text: "Go outside immediately to help - someone might be in trouble",
          outcome: {
            xp: -20,
            feedback: "Well-intentioned but dangerous! Many storm injuries occur when people venture out too early.",
            goto: "AFTERMATH_NORMAL"
          }
        }
      ]
    },

    AFTERMATH_HERO: {
      scene_description: "The storm finally passes completely. You emerge to find significant damage: fallen trees, debris everywhere, and downed power lines sparking on wet pavement. You see neighbors starting to come out to assess damage. What's your approach?",
      image: "/images/drills/weather/aftermath-damage.jpg",
      choices: [
        {
          text: "Immediately warn others about the live power lines and organize a safe neighborhood damage assessment",
          outcome: {
            xp: 30,
            feedback: "Outstanding community leadership! You're prioritizing safety while helping coordinate recovery efforts.",
            goto: "END_SAFE_HERO"
          }
        },
        {
          text: "Focus only on checking your own property damage",
          outcome: {
            xp: 10,
            feedback: "Understandable self-focus, but helping coordinate community safety would be even better.",
            goto: "END_SAFE_NORMAL"
          }
        }
      ]
    },

    AFTERMATH_NORMAL: {
      scene_description: "You ventured out during the storm's lull and got caught in renewed wind and rain, but made it to safety. Now that the storm has truly passed, you see extensive damage including dangerous downed power lines. What do you do?",
      image: "/images/drills/weather/aftermath-damage.jpg",
      choices: [
        {
          text: "Stay well away from all downed wires and report them to emergency services",
          outcome: {
            xp: 15,
            feedback: "Good safety awareness! Treating all downed lines as live and dangerous is correct.",
            goto: "END_SAFE_NORMAL"
          }
        },
        {
          text: "Get closer to the downed wires to see if they're still active",
          outcome: {
            xp: -30,
            feedback: "Extremely dangerous! Downed power lines can kill instantly. Always assume they're energized.",
            goto: "END_FAIL_ELECTROCUTION"
          }
        }
      ]
    },

    // ENDING SCENARIOS
    END_FAIL_OUTSIDE: { 
      scene_description: "MISSION FAILED: You were struck by flying debris while outside during the storm. Never go outside during severe weather - most storm injuries happen to people caught outdoors.", 
      isEnd: true 
    },
    END_FAIL_WINDOWS: { 
      scene_description: "MISSION FAILED: The windows exploded from pressure and debris, causing serious injuries. Always shelter in interior rooms during severe storms.", 
      isEnd: true 
    },
    END_FAIL_ELECTROCUTION: { 
      scene_description: "MISSION FAILED: You were electrocuted by the downed power line. Always assume all downed wires are live and deadly - stay far away and call professionals.", 
      isEnd: true 
    },
    END_SAFE_NORMAL: { 
      scene_description: "MISSION COMPLETE: You survived the severe weather by following basic safety protocols. Well done on protecting yourself and your family!", 
      isEnd: true 
    },
    END_SAFE_HERO: { 
      scene_description: "MISSION COMPLETE: You are a Severe Weather Response Hero! You not only protected your family but also helped organize community safety efforts after the storm. Your leadership prevented injuries and saved lives!", 
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

const SevereWeatherDrill: React.FC<SevereWeatherDrillProps> = ({ onComplete, onBack }) => {
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
      if (percentage >= 95) return { name: "Severe Weather Champion", color: "text-blue-400", icon: "🌩️" };
      if (percentage >= 80) return { name: "Storm Response Hero", color: "text-cyan-400", icon: "⛈️" };
      if (percentage >= 60) return { name: "Weather Responder (Passed)", color: "text-gray-400", icon: "🌪️" };
      if (percentage > 0) return { name: "Weather Safety Trainee", color: "text-slate-400", icon: "☁️" };
      return { name: "Needs Weather Training", color: "text-red-600", icon: "⚠️" };
  };

  const getChoiceVariant = (xp: number) => {
    if (xp >= 20) return 'default';
    if (xp > 0) return 'secondary';
    return 'destructive';
  };

  const renderStartScreen = () => (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Cloud className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-3xl">Severe Weather Response Drill</CardTitle>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn essential severe weather safety protocols for storms, cyclones, and high winds. 
              Master preparation, sheltering, and post-storm safety procedures.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Your Mission:</h3>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Master severe weather preparation and response
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Learn proper sheltering techniques during storms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Navigate post-storm hazards safely
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aim for a score of <span className="font-bold text-foreground">60%</span> or higher to pass
                    </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button onClick={startDrill} size="lg" className="text-lg px-8 bg-blue-600 hover:bg-blue-700">
                Begin Weather Response Drill
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
                {currentNode.scene_description.startsWith("MISSION FAILED") ? "Weather Response Drill Failed" : "Weather Response Drill Complete"}
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
                          <CardTitle className="text-xl text-blue-600 dark:text-blue-400">Severe Weather Response Drill</CardTitle>
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
                                            alt="Weather scenario illustration"
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

export default SevereWeatherDrill;