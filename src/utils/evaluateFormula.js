function createInvalidResult(
  input,
  expression,
  error
) {
  return {
    input,
    expression,
    value: 0,
    isValid: false,
    error,
  };
}

export function evaluateFormulaResult(value) {
  const input =
    value === null || value === undefined
      ? ""
      : String(value);

  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      input,
      expression: "",
      value: 0,
      isValid: true,
      error: "",
    };
  }

  const expression = trimmedInput.startsWith("=")
    ? trimmedInput.slice(1).trim()
    : trimmedInput;

  if (!expression) {
    return createInvalidResult(
      input,
      expression,
      "Formula is empty."
    );
  }

  if (
    !/^[0-9+\-*/().\s]+$/.test(expression)
  ) {
    return createInvalidResult(
      input,
      expression,
      "Formula contains unsupported characters."
    );
  }

  let position = 0;

  function skipWhitespace() {
    while (
      position < expression.length &&
      /\s/.test(expression[position])
    ) {
      position += 1;
    }
  }

  function parseNumber() {
    skipWhitespace();

    const start = position;
    let decimalCount = 0;

    while (position < expression.length) {
      const character = expression[position];

      if (character === ".") {
        decimalCount += 1;

        if (decimalCount > 1) {
          throw new Error(
            "Invalid number format."
          );
        }

        position += 1;
        continue;
      }

      if (!/[0-9]/.test(character)) {
        break;
      }

      position += 1;
    }

    if (start === position) {
      throw new Error(
        "Expected a number."
      );
    }

    const numberText = expression.slice(
      start,
      position
    );

    if (
      numberText === "." ||
      numberText === ""
    ) {
      throw new Error(
        "Invalid number format."
      );
    }

    const parsedNumber = Number(numberText);

    if (!Number.isFinite(parsedNumber)) {
      throw new Error(
        "Number is not valid."
      );
    }

    return parsedNumber;
  }

  function parseFactor() {
    skipWhitespace();

    const character = expression[position];

    if (character === "+") {
      position += 1;
      return parseFactor();
    }

    if (character === "-") {
      position += 1;
      return -parseFactor();
    }

    if (character === "(") {
      position += 1;

      const valueInsideParentheses =
        parseExpression();

      skipWhitespace();

      if (expression[position] !== ")") {
        throw new Error(
          "Missing closing parenthesis."
        );
      }

      position += 1;

      return valueInsideParentheses;
    }

    return parseNumber();
  }

  function parseTerm() {
    let result = parseFactor();

    while (position < expression.length) {
      skipWhitespace();

      const operator = expression[position];

      if (
        operator !== "*" &&
        operator !== "/"
      ) {
        break;
      }

      position += 1;

      const nextValue = parseFactor();

      if (
        operator === "/" &&
        nextValue === 0
      ) {
        throw new Error(
          "Division by zero is not allowed."
        );
      }

      result =
        operator === "*"
          ? result * nextValue
          : result / nextValue;
    }

    return result;
  }

  function parseExpression() {
    let result = parseTerm();

    while (position < expression.length) {
      skipWhitespace();

      const operator = expression[position];

      if (
        operator !== "+" &&
        operator !== "-"
      ) {
        break;
      }

      position += 1;

      const nextValue = parseTerm();

      result =
        operator === "+"
          ? result + nextValue
          : result - nextValue;
    }

    return result;
  }

  try {
    const calculatedValue = parseExpression();

    skipWhitespace();

    if (position !== expression.length) {
      throw new Error(
        "Formula could not be fully evaluated."
      );
    }

    if (!Number.isFinite(calculatedValue)) {
      throw new Error(
        "Formula result is not finite."
      );
    }

    return {
      input,
      expression,
      value: calculatedValue,
      isValid: true,
      error: "",
    };
  } catch (error) {
    return createInvalidResult(
      input,
      expression,
      error instanceof Error
        ? error.message
        : "Formula is invalid."
    );
  }
}

export function evaluateFormula(value) {
  return evaluateFormulaResult(value).value;
}