import { itemBlueprint } from "./interfaces";
import lists from "../data/lists.json";
import { errorMessages } from "./data";
import { randomInt } from "./rng";

const listRegExp: RegExp = /^([wshtlfi])_(.+)$/;
export function blueprintListSelector(blueprint: string): itemBlueprint {
  let matchResult: RegExpMatchArray | null;
  let type: string;
  let blueprintName: string;
  for (let i = 0; i < 10; i++) {
    matchResult = blueprint.match(listRegExp);
    if (matchResult == null) {
      errorMessages.push(`Invalid blueprint list ${blueprint}`);
      return { type: "none" };
    }
    [, type, blueprintName] = matchResult;
    if (blueprintName == "EMPTY") {
      return { type: "none" };
    }
    switch (type) {
      case "w":
        return { type: "weapon", blueprint: blueprintName };
      case "s":
        return { type: "spell", blueprint: blueprintName };
      case "h":
        return { type: "head", blueprint: blueprintName };
      case "t":
        return { type: "torso", blueprint: blueprintName };
      case "l":
        return { type: "legs", blueprint: blueprintName };
      case "f":
        return { type: "feet", blueprint: blueprintName };
    }
    //@ts-expect-error: Typescript is inferring the type from the json file
    let selectedList = lists[blueprintName];
    if (selectedList == undefined) {
      errorMessages.push(`Unable to find list ${blueprintName}`);
      return { type: "none" };
    }
    if (selectedList.length == 0) {
      errorMessages.push(`List ${blueprintName} is empty`);
      return { type: "none" };
    }
    blueprint = selectedList[randomInt(0, selectedList.length)];
  }
  errorMessages.push(`Exceeded maximum list depth loading blueprint list ${blueprint}`);
  return { type: "none" };
}
