import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, Trophy, AlertTriangle, CheckCircle } from "lucide-react";

interface FloodDrillProps {
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

// --- STORY DATA ---
const storyData = {
  maxPossibleScore: 345,
  nodes: {
    START: {
      scene_description: "It's 11:30 AM, Friday, September 12th, 2025. After two days of relentless rain in Mumbai, your school's ground floor is flooding. You're in your classroom when the lights flicker ominously.",
      image: "/images/drills/flood/classroom-flickering.jpg", // Optional image path
      choices: [
        { text: "Keep watching the rain. It's just a typical heavy monsoon day.", outcome: { xp: 0, feedback: "Underestimating the situation can be risky. Let's see what happens.", goto: 'FLICKER_CHOICE' } },
        { text: "Check the city's official disaster alert app on your phone.", outcome: { xp: 10, feedback: "Smart move. You see a RED ALERT for flash flooding. You are now better prepared.", goto: 'FLICKER_CHOICE' } },
        { text: "Tell your teacher you're worried about the rising water and flickering lights.", outcome: { xp: 25, feedback: "Excellent. Alerting an authority figure shows great situational awareness.", goto: 'FLICKER_CHOICE' } }
      ]
    },
    FLICKER_CHOICE: {
      scene_description: "The lights flicker again and go out, leaving the room in gloomy daylight. The teacher tells everyone to remain calm. What's your immediate thought?",
      image: "/images/drills/flood/lights-out.jpg",
      choices: [
        { text: "This is serious. I should prepare to move.", outcome: { xp: 25, feedback: "You have the right mindset. Staying alert is critical.", goto: 'FLOOD_ALERT' } },
        { text: "It's just a power cut. I'll wait for instructions.", outcome: { xp: -5, feedback: "While waiting for instructions is good, passive waiting can cost you valuable time.", goto: 'FLOOD_ALERT' } },
        { text: "Take out my phone to record a video for social media.", outcome: { xp: -10, feedback: "Posting on social media isn't a priority. You are wasting critical time and phone battery.", goto: 'FLOOD_ALERT' } }
      ]
    },
    FLOOD_ALERT: {
      scene_description: "A loud, continuous emergency bell rings! A PA announcement crackles: 'Attention! Flood emergency! Evacuate all ground floor classrooms. Proceed to the auditorium on the third floor. This is not a drill.' Murky water starts seeping under the door.",
      image: "/images/drills/flood/emergency-announcement.jpg",
      choices: [
        { text: "Grab your heavy school bag with all your books.", outcome: { xp: -10, feedback: "Your bag will slow you down. In an emergency, prioritize speed over possessions.", goto: 'CORRIDOR_CHOICE_SLOW' } },
        { text: "Leave everything and immediately head for the door.", outcome: { xp: 30, feedback: "Correct! Your life is more important than your belongings.", goto: 'CORRIDOR_CHOICE_FAST' } },
        { text: "Help the teacher open the jammed supply closet to get a flashlight.", outcome: { xp: 5, feedback: "Helping is good, but the primary instruction was to evacuate. A risky time trade-off.", goto: 'CORRIDOR_CHOICE_SLOW' } }
      ]
    },
    CORRIDOR_CHOICE_FAST: {
      scene_description: "You're in the chaotic, ankle-deep water of the corridor. You see your friend, Priya, a few feet away, struggling to zip up her oversized bag.",
      image: "/images/drills/flood/corridor-water.jpg",
      choices: [
        { text: "Shout 'Leave the bag!' and pull her along with you.", outcome: { xp: 30, feedback: "Excellent teamwork! You both move quickly towards the stairs.", goto: 'STAIRCASE_JAM' } },
        { text: "Run ahead to the stairs to save yourself.", outcome: { xp: -5, feedback: "You are safe, but a true champion helps others.", goto: 'STAIRCASE_JAM_SOLO' } },
        { text: "Tell her to hurry up but keep moving yourself.", outcome: { xp: 10, feedback: "A reasonable choice, you prompted action without slowing down.", goto: 'STAIRCASE_JAM_SOLO' } }
      ]
    },
    CORRIDOR_CHOICE_SLOW: {
      scene_description: "You were delayed. The corridor water is now knee-deep with a noticeable current. Your heavy bag makes it hard to balance. You see Priya also struggling.",
       choices: [
        { text: "Ditch your own bag to move faster and then help Priya.", outcome: { xp: 25, feedback: "You made the right call, leaving your bag. You can now move freely.", goto: 'STAIRCASE_JAM' } },
        { text: "Ignore Priya and focus on dragging your own bag.", outcome: { xp: -20, feedback: "Your bag gets snagged on a floating desk. You are stuck.", goto: 'END_FAIL_POSSESSIONS' } },
        { text: "Try to help Priya while also holding onto your heavy bag.", outcome: { xp: -15, feedback: "A noble thought, but your bag makes you too slow and unstable. You both struggle against the current.", goto: 'END_FAIL_WASTED_TIME' } }
      ]
    },
    STAIRCASE_JAM: {
      scene_description: "You reach the main staircase. It's a bottleneck, dangerously crowded and barely moving. You remember a less-used staircase in the science wing.",
      choices: [
        { text: "Try to push through the crowd.", outcome: { xp: -20, feedback: "You got caught in the crush of the crowd.", goto: 'END_FAIL_CROWD' } },
        { text: "Wait for the crowd to clear.", outcome: { xp: -10, feedback: "You waited too long as the water rose.", goto: 'END_FAIL_WASTED_TIME' } },
        { text: "Shout 'There's another way!' and lead others to the back staircase.", outcome: { xp: 30, feedback: "Smart and decisive leadership!", goto: 'ALT_ROUTE_CHOICE' } }
      ]
    },
    STAIRCASE_JAM_SOLO: {
        scene_description: "You reach the main staircase alone. It is dangerously crowded and panicked. You recall the back staircase in the science wing.",
        choices: [
            { text: "Risk the crowd. It's the official route.", outcome: { xp: -15, feedback: "The official route isn't always the safest. You got stuck.", goto: 'END_FAIL_CROWD'}},
            { text: "Find the alternate route yourself.", outcome: { xp: 25, feedback: "Good independent thinking. You head for the science wing.", goto: 'ALT_ROUTE_CHOICE' }},
            { text: "Wait at the bottom of the stairs, hoping the crowd thins out.", outcome: { xp: -10, feedback: "Waiting is a dangerous gamble. The water is rising steadily, and you've lost valuable time.", goto: 'END_FAIL_WASTED_TIME' } }
        ]
    },
    ALT_ROUTE_CHOICE: {
        scene_description: "You are heading towards the science wing. The corridor is less crowded. You can hear a strange buzzing sound ahead.",
        choices: [
            { text: "Proceed with caution towards the sound.", outcome: { xp: 25, feedback: "You are being cautious, which is good.", goto: 'ALT_ROUTE_HAZARD'}},
            { text: "Ignore it and just keep running.", outcome: { xp: -10, feedback: "Ignoring a potential warning sign is reckless.", goto: 'ALT_ROUTE_HAZARD'}},
            { text: "Assume it's dangerous and go back to the crowded main staircase.", outcome: { xp: 0, feedback: "Avoiding a potential unknown is safe, but now you are back facing the original dangerous bottleneck.", goto: 'STAIRCASE_JAM' } }
        ]
    },
    ALT_ROUTE_HAZARD: {
        scene_description: "You round the corner. A damaged electrical junction box on the wall is half-submerged and throwing off bright blue sparks. The water around it is fizzing.",
        image: "/images/drills/flood/electrical-hazard.jpg",
        choices: [
            { text: "Walk carefully along the opposite wall, as far from the sparks as possible.", outcome: { xp: 40, feedback: "Perfect. You correctly identified the hazard and avoided it safely.", goto: 'STAIRCASE_TWO_HAZARD'}},
            { text: "Wade right through the middle.", outcome: { xp: -30, feedback: "You stepped into electrified water.", goto: 'END_FAIL_HAZARD'}},
            { text: "Turn back and risk the crowded main staircase.", outcome: { xp: 5, feedback: "You avoided the immediate danger, but heading back towards the main, crowded staircase is still very risky.", goto: 'STAIRCASE_JAM' }}
        ]
    },
    STAIRCASE_TWO_HAZARD: {
        scene_description: "You reach the back staircase. As you climb, you see a large window has shattered on the landing between the first and second floors, leaving jagged glass shards.",
        choices: [
            { text: "Carefully clear a path by pushing the large glass pieces away with your foot.", outcome: { xp: 25, feedback: "Good problem-solving. You've made the path safer for yourself and others.", goto: 'SECOND_FLOOR_LANDING'}},
            { text: "Try to jump over the glass.", outcome: { xp: -15, feedback: "You slipped on the wet floor and got a minor cut. A risky move that didn't pay off.", goto: 'SECOND_FLOOR_LANDING'}},
            { text: "Just walk through it carefully.", outcome: { xp: 5, feedback: "You were careful, but still got a small cut. Taking a moment to clear the path would have been better.", goto: 'SECOND_FLOOR_LANDING'}}
        ]
    },
    SECOND_FLOOR_LANDING: {
        scene_description: "You are safely on the second floor. A teacher, Mrs. Desai, is helping a student with a cut leg. 'I need the large trauma kit from the first-aid station around the corner!' she shouts.",
        choices: [
            { text: "'Yes, Ma'am! I'll get it.'", outcome: { xp: 25, feedback: "A courageous and compassionate choice.", goto: 'FIRST_AID_ROOM'}},
            { text: "'Sorry Ma'am, I have to get to the auditorium.'", outcome: { xp: -20, feedback: "You ignored a request for help in an emergency.", goto: 'AUDITORIUM_APPROACH'}},
            { text: "Shout to another student further down the hall to get it.", outcome: { xp: 5, feedback: "Delegating is an option, but taking initiative yourself is better.", goto: 'AUDITORIUM_APPROACH'}}
        ]
    },
    FIRST_AID_ROOM: {
        scene_description: "You find the first-aid station. The door is closed. You hear faint crying from inside. The sign says 'Pull'.",
        choices: [
            { text: "Pull the door open and announce yourself.", outcome: { xp: 25, feedback: "You enter and find a scared junior student hiding. You comfort them and grab the kit.", goto: 'HELP_JUNIOR'}},
            { text: "Knock first before entering.", outcome: { xp: -5, feedback: "Polite, but in an emergency, every second counts. You wasted valuable time.", goto: 'HELP_JUNIOR'}},
            { text: "Ignore the crying, grab the first kit you see on a shelf outside, and leave.", outcome: { xp: -15, feedback: "You grabbed a small, basic kit, not the trauma kit the teacher asked for. You also ignored someone who might need help.", goto: 'AUDITORIUM_APPROACH' } }
        ]
    },
    HELP_JUNIOR: {
        scene_description: "You have the heavy trauma kit. The junior student is too scared to move. You now have to get the kit and the student to safety.",
        choices: [
            { text: "Give the student a simple, firm instruction: 'It's safer with me. We have to go now.'", outcome: { xp: 40, feedback: "Your confidence calms them. They follow you.", goto: 'CARRY_KIT_SUCCESS'}},
            { text: "Leave the student and just take the kit.", outcome: { xp: -25, feedback: "You abandoned a child in a dangerous situation.", goto: 'AUDITORIUM_APPROACH'}},
            { text: "Tell the student to wait there while you bring the kit to the teacher.", outcome: { xp: 5, feedback: "You completed the primary mission of getting the kit, but leaving a scared child alone is still a significant risk.", goto: 'AUDITORIUM_APPROACH'}}
        ]
    },
    CARRY_KIT_SUCCESS: {
      scene_description: "You bring the kit and the junior student to Mrs. Desai. She is relieved. 'Excellent work. Now get yourselves to the auditorium, safely.'",
      choices: [
        { text: "Guide the junior student to the auditorium.", outcome: { xp: 30, feedback: "You took full responsibility and saw it through to the end.", goto: 'END_SAFE_HERO' } },
        { text: "Tell the junior student to go on while you return the kit.", outcome: { xp: 10, feedback: "You made sure the kit was delivered, but it was better to ensure the student got to safety personally.", goto: 'AUDITORIUM_APPROACH' } },
        { text: "Take the student and the kit, but go look for your own friends first.", outcome: { xp: -10, feedback: "Your priority should be the safe point. Deviating from the evacuation route is risky.", goto: 'AUDITORIUM_APPROACH' } }
      ]
    },
    AUDITORIUM_APPROACH: {
      scene_description: "You are approaching the third floor. The corridor is safe and dry. Teachers are directing students into the auditorium.",
      choices: [
          { text: "Walk straight into the auditorium.", outcome: { xp: -5, feedback: "You're safe, but by not checking in, you've created confusion for the teachers trying to account for everyone.", goto: 'END_SAFE_NORMAL'}},
          { text: "Report to the teacher at the door for a headcount check-in.", outcome: { xp: 25, feedback: "Perfect. Following protocol helps organizers know everyone is accounted for.", goto: 'END_SAFE_CHECKED_IN'}},
          { text: "Find your friends inside the auditorium first, then check in.", outcome: { xp: 5, feedback: "Finding your friends is understandable, but checking in first is the correct protocol to ensure everyone is accounted for quickly.", goto: 'END_SAFE_NORMAL' } }
      ]
    },
    END_FAIL_POSSESSIONS: { scene_description: "MISSION FAILED. Your bag got snagged. Possessions can be replaced, lives cannot. Evacuate hands-free.", isEnd: true },
    END_FAIL_CROWD: { scene_description: "MISSION FAILED. You got caught in the crowd. Pushing into a panicked mob can cause serious injury. Always seek an alternative route.", isEnd: true },
    END_FAIL_WASTED_TIME: { scene_description: "MISSION FAILED. You waited too long and the water level became too dangerous. In a disaster, you must be decisive.", isEnd: true },
    END_FAIL_HAZARD: { scene_description: "MISSION FAILED. You were electrocuted. Water and electricity are a deadly combination. Always assume submerged wires are live.", isEnd: true },
    END_SAFE_NORMAL: { scene_description: "MISSION COMPLETE. You made it to safety, but missed opportunities to help others and follow all protocols. Review your choices to improve.", isEnd: true },
    END_SAFE_CHECKED_IN: { scene_description: "MISSION COMPLETE! You made it to the safe zone and correctly followed check-in procedures. Excellent work.", isEnd: true },
    END_SAFE_HERO: { scene_description: "MISSION COMPLETE! You not only got to safety but you helped others, navigated multiple hazards, and showed true leadership. You are a Suraksha Champion!", isEnd: true }
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

const FloodDrill: React.FC<FloodDrillProps> = ({ onComplete, onBack }) => {
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
      if (percentage >= 95) return { name: "Platinum Suraksha Champion", color: "text-cyan-400", icon: "🛡" };
      if (percentage >= 80) return { name: "Gold Suraksha Cadet", color: "text-yellow-400", icon: "🥇" };
      if (percentage >= 60) return { name: "Silver Responder (Passed)", color: "text-gray-400", icon: "🥈" };
      if (percentage > 0) return { name: "Bronze Trainee", color: "text-orange-400", icon: "🥉" };
      return { name: "Recruit", color: "text-red-400", icon: "⛑" };
  };

  const getChoiceVariant = (xp: number) => {
    if (xp >= 25) return 'default'; // Best choice
    if (xp > 0) return 'secondary'; // Good choice
    return 'destructive'; // Poor choice
  };

  const renderStartScreen = () => (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl">Flood Evacuation Drill</CardTitle>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This virtual simulation will test your decision-making skills during a flash flood. 
              Your choices matter. Stay calm, think clearly, and keep safety the top priority.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-primary mb-3">Your Mission:</h3>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Navigate challenging scenarios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Prioritize safety for yourself and others
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aim for a score of <span className="font-bold text-foreground">60%</span> or higher to pass
                    </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button onClick={startDrill} size="lg" className="text-lg px-8">
                Begin Virtual Drill
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
                {currentNode.scene_description.startsWith("MISSION FAILED") ? "Drill Failed" : "Drill Complete"}
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
                          <CardTitle className="text-xl text-primary">Flood Evacuation Drill</CardTitle>
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
                                            alt="Scenario illustration"
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

export default FloodDrill;