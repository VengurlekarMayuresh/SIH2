import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, AlertTriangle, CheckCircle, Heart } from "lucide-react";

interface HealthCrisisDrillProps {
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

// --- CORRECTED HEALTH CRISIS DRILL STORY DATA ---
const storyData = {
  maxPossibleScore: 120, // Corrected max score
  nodes: {
    START: {
      scene_description: "Breaking news alerts your phone: A highly contagious virus is rapidly spreading in your city. Schools and authorities are issuing health advisories. What's your immediate response?",
      image: "/images/drills/health/news-alert.jpg",
      choices: [
        {
          text: "Follow health guidelines closely and stay informed from reliable sources",
          outcome: { xp: 15, feedback: "Excellent! Staying informed from trusted sources helps you make safe decisions.", goto: "SYMPTOMS" }
        },
        {
          text: "Ignore the news - it's probably exaggerated media hype",
          outcome: { xp: -15, feedback: "Dangerous thinking! Ignoring health warnings puts you and others at serious risk.", goto: "END_FAIL_IGNORED" }
        }
      ]
    },

    SYMPTOMS: {
      scene_description: "You wake up feeling unwell with a mild cough, slight fever, and fatigue. These could be symptoms of the virus spreading in your community. What's your responsible response?",
      image: "/images/drills/health/feeling-sick.jpg",
      choices: [
        {
          text: "Stay home immediately, wear a mask, isolate, and inform family about symptoms",
          outcome: { xp: 20, feedback: "Perfect response! Self-isolation when symptomatic is crucial to prevent community spread.", goto: "HYGIENE" }
        },
        {
          text: "Go to school anyway - it's just a minor cold and you have important tests",
          outcome: { xp: -25, feedback: "Very dangerous! Attending school while symptomatic could infect dozens of people.", goto: "END_FAIL_SPREAD" }
        }
      ]
    },

    HYGIENE: {
      scene_description: "While isolating at home, your parents emphasize the importance of proper hygiene practices. You need to use the shared bathroom. What's the most effective hygiene routine?",
      image: "/images/drills/health/hand-washing.jpg",
      choices: [
        {
          text: "Wash hands thoroughly with soap for 20+ seconds, use hand sanitizer, disinfect surfaces",
          outcome: { xp: 20, feedback: "Outstanding hygiene! Proper handwashing eliminates most pathogens and protects your family.", goto: "MASKS" }
        },
        {
          text: "Rinse hands quickly with just water - that should be enough",
          outcome: { xp: -10, feedback: "Insufficient! Water alone doesn't kill viruses. Soap and proper technique are essential.", goto: "MASKS" }
        }
      ]
    },

    MASKS: {
      scene_description: "After a few days of isolation, you need to go out for essential medications. The pharmacy is crowded with people. How do you prepare for this necessary trip?",
      image: "/images/drills/health/wearing-mask.jpg",
      choices: [
        {
          text: "Wear a proper mask, maintain 6-foot distance, use hand sanitizer, limit time outside",
          outcome: { xp: 25, feedback: "Exemplary preparation! Multi-layered protection significantly reduces transmission risk.", goto: "SOCIAL_DISTANCING" }
        },
        {
          text: "Go without precautions - you're probably not contagious anymore",
          outcome: { xp: -25, feedback: "Extremely risky! You could still be contagious and put vulnerable people in danger.", goto: "END_FAIL_RECKLESS" }
        }
      ]
    },

    SOCIAL_DISTANCING: {
      scene_description: "Your best friend is having a birthday party this weekend and really wants you there. There will be 15 people indoors without masks. What's your decision?",
      image: "/images/drills/health/party-invitation.jpg",
      choices: [
        {
          text: "Politely decline and suggest a virtual celebration or outdoor meetup instead",
          outcome: { xp: 20, feedback: "Wise and caring choice! You're protecting everyone while maintaining friendships.", goto: "HELPING_COMMUNITY" }
        },
        {
          text: "Attend the party - you've been careful enough and deserve some fun",
          outcome: { xp: -30, feedback: "Poor decision! Indoor gatherings are superspreader events that endanger everyone.", goto: "END_FAIL_SUPERSPREADER" }
        }
      ]
    },

    HELPING_COMMUNITY: {
      scene_description: "Your elderly neighbors are in quarantine after testing positive. They can't leave their home and are running out of essential supplies and medications. How do you respond?",
      image: "/images/drills/health/helping-neighbors.jpg",
      choices: [
        {
          text: "Organize contactless delivery - leave groceries and supplies at their doorstep safely",
          outcome: { xp: 25, feedback: "Heroic community service! You're helping vulnerable people while maintaining safety protocols.", goto: "VACCINE_HERO" }
        },
        {
          text: "Visit them in person to help with household tasks",
          outcome: { xp: -20, feedback: "Well-intentioned but unsafe! Direct contact could infect you or spread virus further.", goto: "VACCINE_NORMAL" }
        }
      ]
    },

    VACCINE_HERO: {
      scene_description: "Vaccines become available for your age group. You've been helping your community throughout the pandemic. Some friends are hesitant about vaccination. What do you do?",
      image: "/images/drills/health/vaccination-drive.jpg",
      choices: [
        {
          text: "Get vaccinated and share factual information to help friends make informed decisions",
          outcome: { xp: 20, feedback: "Outstanding leadership! You're protecting yourself and educating others with science-based information.", goto: "END_SAFE_HERO" }
        },
        {
          text: "Get vaccinated but don't interfere with friends' personal choices",
          outcome: { xp: 10, feedback: "Good personal choice, but sharing accurate health information helps the whole community.", goto: "END_SAFE_NORMAL" }
        }
      ]
    },

    VACCINE_NORMAL: {
      scene_description: "A vaccination drive is announced for your age group at the local health center. What's your response to this opportunity?",
      image: "/images/drills/health/vaccination-drive.jpg",
      choices: [
        {
          text: "Register immediately and get vaccinated when your turn comes",
          outcome: { xp: 15, feedback: "Excellent! Vaccination protects you, your family, and vulnerable community members.", goto: "END_SAFE_NORMAL" }
        },
        {
          text: "Refuse vaccination due to fear and misinformation",
          outcome: { xp: -20, feedback: "Dangerous decision! Refusing vaccines prolongs the pandemic and endangers everyone.", goto: "END_FAIL_UNVACCINATED" }
        }
      ]
    },

    // ENDING SCENARIOS
    END_FAIL_IGNORED: { 
      scene_description: "MISSION FAILED: You ignored health warnings and became part of the problem. Always take public health advisories seriously.", 
      isEnd: true 
    },
    END_FAIL_SPREAD: { 
      scene_description: "MISSION FAILED: You attended school while symptomatic and infected multiple classmates and teachers. Isolation when sick saves lives.", 
      isEnd: true 
    },
    END_FAIL_RECKLESS: { 
      scene_description: "MISSION FAILED: Your reckless behavior in public spaces contributed to community spread. Personal responsibility protects everyone.", 
      isEnd: true 
    },
    END_FAIL_SUPERSPREADER: { 
      scene_description: "MISSION FAILED: The party became a superspreader event. Many attendees got sick, and some suffered severe complications. Social distancing saves lives.", 
      isEnd: true 
    },
    END_FAIL_UNVACCINATED: { 
      scene_description: "MISSION FAILED: Your refusal to vaccinate left you and others vulnerable. Vaccines are safe, effective, and essential for community protection.", 
      isEnd: true 
    },
    END_SAFE_NORMAL: { 
      scene_description: "MISSION COMPLETE: You followed health guidelines and protected yourself during the health crisis. Well done on being responsible!", 
      isEnd: true 
    },
    END_SAFE_HERO: { 
      scene_description: "MISSION COMPLETE: You are a Public Health Hero! You not only protected yourself but also helped vulnerable community members and promoted science-based health information. Your actions saved lives!", 
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

const HealthCrisisDrill: React.FC<HealthCrisisDrillProps> = ({ onComplete, onBack }) => {
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
      if (percentage >= 95) return { name: "Public Health Champion", color: "text-green-400", icon: "💚" };
      if (percentage >= 80) return { name: "Health Crisis Hero", color: "text-blue-400", icon: "🏥" };
      if (percentage >= 60) return { name: "Health Responder (Passed)", color: "text-purple-400", icon: "🩺" };
      if (percentage > 0) return { name: "Health Safety Trainee", color: "text-gray-400", icon: "📋" };
      return { name: "Needs Health Education", color: "text-red-600", icon: "⚠️" };
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
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-3xl">Health Crisis Response Drill</CardTitle>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn essential public health practices during pandemic situations. Master infection control, 
              community responsibility, and evidence-based health decision making.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">Your Mission:</h3>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Practice proper hygiene and infection control
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Make responsible decisions during health emergencies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Support vulnerable community members safely
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aim for a score of <span className="font-bold text-foreground">60%</span> or higher to pass
                    </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button onClick={startDrill} size="lg" className="text-lg px-8 bg-green-600 hover:bg-green-700">
                Begin Health Crisis Drill
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
                {currentNode.scene_description.startsWith("MISSION FAILED") ? "Health Crisis Drill Failed" : "Health Crisis Drill Complete"}
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
                          <CardTitle className="text-xl text-green-600 dark:text-green-400">Health Crisis Response Drill</CardTitle>
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
                                            alt="Health crisis scenario illustration"
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

export default HealthCrisisDrill;