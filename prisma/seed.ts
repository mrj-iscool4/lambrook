import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "General Community",
    description: "Standards that apply to everyone using UKRP.",
    icon: "Users",
    sortOrder: 0,
  },
  {
    name: "Roleplay",
    description: "Rules governing realistic and enjoyable roleplay.",
    icon: "Shield",
    sortOrder: 1,
  },
  {
    name: "Vehicles",
    description: "Standards for realistic driving and vehicle use.",
    icon: "Car",
    sortOrder: 2,
  },
  {
    name: "Criminal Roleplay",
    description: "Rules covering robberies, pursuits and criminal scenarios.",
    icon: "Gavel",
    sortOrder: 3,
  },
  {
    name: "Emergency Services",
    description:
      "Standards for police, medical and other emergency-service roleplay.",
    icon: "Siren",
    sortOrder: 4,
  },
  {
    name: "Staff",
    description: "Additional standards applicable to UKRP staff.",
    icon: "ShieldAlert",
    sortOrder: 5,
  },
];

const rules = [
  ["R-01", 0, "Respect other members", "All members are expected to treat other players, staff and community members with respect. Personal disagreements must not become harassment or abuse.", "Standard"],
  ["R-02", 0, "No harassment", "Targeted harassment, bullying, intimidation or persistent unwanted contact is not permitted.", "Serious"],
  ["R-03", 0, "No discrimination", "Discriminatory, hateful or derogatory behaviour directed at another person or protected characteristic is prohibited.", "Severe"],
  ["R-04", 0, "No advertising", "Advertising other communities, services, products or external projects without permission is prohibited.", "Standard"],
  ["R-05", 0, "No impersonation", "Do not impersonate another player, member of staff, public figure or organisation in a way that could cause confusion or harm.", "Serious"],
  ["R-06", 0, "Follow staff instructions", "Reasonable instructions given by authorised staff must be followed. Staff decisions may be challenged through the appropriate appeal process rather than through disruption.", "Standard"],

  ["R-07", 1, "Remain in character", "Players should remain in character while actively roleplaying. Out-of-character conversations should not unnecessarily disrupt active scenes.", "Standard"],
  ["R-08", 1, "No FailRP", "Actions that disregard realistic roleplay, the surrounding situation or your character's circumstances are prohibited.", "Serious"],
  ["R-09", 1, "No Random Deathmatch", "Killing or attempting to kill another player without a legitimate roleplay justification is prohibited.", "Severe"],
  ["R-10", 1, "No Vehicle Deathmatch", "Using a vehicle to intentionally run over, ram or kill another player without legitimate roleplay justification is prohibited.", "Severe"],
  ["R-11", 1, "No metagaming", "Information obtained outside of roleplay must not be used to influence your character's in-game decisions.", "Serious"],
  ["R-12", 1, "No powergaming", "Players must not force actions or outcomes onto another player without giving them a reasonable opportunity to respond.", "Serious"],
  ["R-13", 1, "Value your character's life", "Players are expected to act as though their character values their own safety. Recklessly ignoring serious threats can constitute FailRP.", "Standard"],
  ["R-14", 1, "No roleplay evasion", "Do not intentionally leave, reset or otherwise evade an active roleplay situation in order to avoid its consequences.", "Serious"],

  ["R-15", 2, "Drive realistically", "Vehicles should be operated in a manner appropriate to the situation. Excessive or unrealistic driving may be treated as FailRP.", "Standard"],
  ["R-16", 2, "No intentional ramming", "Intentionally using your vehicle to ram another vehicle or player without reasonable roleplay justification is prohibited.", "Serious"],
  ["R-17", 2, "Respect traffic situations", "Players should follow traffic signals, road layouts and other applicable traffic rules unless a legitimate roleplay situation requires otherwise.", "Standard"],
  ["R-18", 2, "Emergency vehicle conduct", "Emergency vehicles must be used for legitimate emergency-service roleplay and should not be abused for personal advantage.", "Serious"],
  ["R-19", 2, "No vehicle abuse", "Do not intentionally exploit vehicle mechanics, map geometry or game systems to gain an unfair advantage.", "Severe"],

  ["R-20", 3, "Criminal roleplay must have purpose", "Criminal activity should create meaningful roleplay rather than being used solely to cause disruption or obtain kills.", "Standard"],
  ["R-21", 3, "No random escalation", "Players must not immediately escalate minor interactions into serious violence without reasonable roleplay justification.", "Serious"],
  ["R-22", 3, "Hostage situations", "Hostage scenarios must remain realistic. Hostages must not be taken solely to create an unavoidable advantage or to bypass normal roleplay.", "Serious"],
  ["R-23", 3, "Robberies", "Robberies must be conducted as roleplay scenarios. Players must not repeatedly start robberies simply to force police interaction or farm rewards.", "Standard"],
  ["R-24", 3, "Respect active pursuits", "Players who are not directly involved in an active pursuit should not intentionally interfere with it.", "Standard"],
  ["R-25", 3, "No combat logging", "Leaving the game to avoid arrest, death, consequences or an active criminal situation is prohibited.", "Severe"],

  ["R-26", 4, "Remain professional", "Emergency-service players are expected to maintain professional conduct while on duty and represent their department appropriately.", "Standard"],
  ["R-27", 4, "No abuse of authority", "Emergency-service powers must not be used to gain personal advantages, target players unfairly or create unnecessary disruption.", "Severe"],
  ["R-28", 4, "Use appropriate force", "Police players must use a reasonable level of force for the situation and should attempt to de-escalate where appropriate.", "Serious"],
  ["R-29", 4, "Follow department procedures", "Players should follow their department's operational procedures and any additional instructions issued by authorised department leadership.", "Standard"],
  ["R-30", 4, "No unnecessary interference", "Emergency-service players must not intentionally interfere with another department's legitimate roleplay without a reasonable operational justification.", "Standard"],

  ["R-31", 5, "Staff must remain professional", "Staff members are expected to act professionally and fairly when dealing with members of the community.", "Serious"],
  ["R-32", 5, "No abuse of staff powers", "Moderation permissions must only be used for legitimate staff purposes. Abuse of administrative tools may result in immediate removal of permissions.", "Severe"],
  ["R-33", 5, "Remain impartial", "Staff must not use their position to unfairly benefit friends, punish players because of personal disagreements or interfere in cases involving a conflict of interest.", "Severe"],
  ["R-34", 5, "Moderation decisions require justification", "Significant moderation actions should be supported by appropriate evidence and recorded accurately within the moderation system.", "Serious"],
  ["R-35", 5, "Respect the appeal process", "Appeals must be reviewed objectively. Staff must not reject an appeal solely because of personal disagreements with the appellant.", "Serious"],
  ["R-36", 5, "Confidential information", "Internal moderation information, staff discussions and private player information must not be disclosed without authorisation.", "Severe"],
] as const;

async function main() {
  console.log("Seeding UKRP rules...");

  for (const category of categories) {
    await prisma.ruleCategory.upsert({
      where: {
        id: `seed-category-${category.sortOrder}`,
      },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        id: `seed-category-${category.sortOrder}`,
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        active: true,
      },
    });
  }

  for (const [
    ruleNumber,
    categoryIndex,
    title,
    description,
    severity,
  ] of rules) {
    await prisma.rule.upsert({
      where: { ruleNumber },
      update: {
        title,
        description,
        severity,
        categoryId: `seed-category-${categoryIndex}`,
        published: true,
        archived: false,
      },
      create: {
        ruleNumber,
        title,
        description,
        severity,
        categoryId: `seed-category-${categoryIndex}`,
        sortOrder: Number(ruleNumber.replace("R-", "")),
        published: true,
        archived: false,
      },
    });
  }

  console.log(`Created ${rules.length} rules.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });