---
# The consulted and informed fields are optional, feel free to remove them if not needed.
status: "{proposed | rejected | accepted | deprecated | … | superseded by ADR-0123}"
date: {YYYY-MM-DD when the decision was last updated}
decision-makers: {list everyone involved in the decision, humans and LLMs}
consulted: {list everyone whose opinions are sought (typically subject-matter
  experts or LLMs); and with whom there is a two-way communication}
informed: {list everyone who is kept up-to-date on progress; and with whom there is
  a one-way communication}
---

# {short title, representative of solved problem and found solution}

## Context and Problem Statement

{Describe the context and problem in two or three sentences or an illustrative story.
You may state the problem as a question.
Consider linking collaboration boards or issue management systems.
Make the decision's scope explicit.
For example, identify relevant structural elements: components, connectors, and others.}

<!-- This is an optional element. Feel free to remove. -->
## Decision Drivers

- {decision driver 1, for instance, a desired software quality, faced concern,
  constraint or force}
- {decision driver 2}
- … <!-- numbers of drivers can vary -->

## Considered Options

- {title of option 1}
- {title of option 2}
- {title of option 3}
- … <!-- numbers of options can vary -->

## Decision Outcome

Chosen option: "{title of option 1}", because {justification.
For example, the only option meeting the k.o. criterion decision driver.
Alternatively, it resolves force {force} or comes out best (see below). …}

<!-- This is an optional element. Feel free to remove. -->
### Consequences

- Good, because {positive consequence, e.g., improvement of one or more desired
  qualities, …}
- Bad, because {negative consequence, e.g., compromising one or more desired
  qualities, …}
- … <!-- numbers of consequences can vary -->

<!-- This is an optional element. Feel free to remove. -->
### Confirmation

{Describe how the implementation / compliance of the ADR can/will be confirmed. Is
there any automated or manual fitness function? If so, list it and explain how it is
applied. Is the chosen design and its implementation in line with the decision?
For example, a design/code review can validate this.
A test using a library such as ArchUnit can also help.
Note that although we classify this element as optional, it is included in many ADRs.}

<!-- This is an optional element. Feel free to remove. -->
## Pros and Cons of the Options

### {title of option 1}

<!-- This is an optional element. Feel free to remove. -->
{example | description | pointer to more information | …}

- Good, because {argument a}
- Good, because {argument b}
<!-- use "neutral" if the given argument weights neither for good nor bad -->
- Neutral, because {argument c}
- Bad, because {argument d}
- … <!-- numbers of pros and cons can vary -->

### {title of other option}

{example | description | pointer to more information | …}

- Good, because {argument a}
- Neutral, because {argument b}
- Bad, because {argument c}
- …

<!-- This is an optional element. Feel free to remove. -->
## More Information

{Provide more evidence or confidence for the outcome, if needed.
Document any team agreement or define when and how to implement the decision.
State when to revisit it.
Link to other decisions and resources when relevant.}
