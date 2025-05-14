# Insurance Smart Contract Testing

## Overview

This project implements comprehensive unit testing for a Hyperledger Fabric insurance smart contract (chaincode). The test suite ensures reliability and maintainability of the insurance policy management system.

## Features Tested

- ✅ Policy Creation
- ✅ Policy Consultation
- ✅ Claims Registration
- ✅ Claims Processing
- ✅ Policy History Tracking
- ✅ Policy Renewal
- ✅ Policy Cancellation
- ✅ Premium Calculation
- ✅ Private Data Handling
- ✅ Error Scenarios

## Technology Stack

- **Testing Framework**: Mocha
- **Assertion Library**: Chai
- **Mocking Library**: Sinon
- **Code Coverage**: NYC
- **Smart Contract Platform**: Hyperledger Fabric

## Test Coverage

| Metric     | Coverage | Details |
| ---------- | -------- | ------- |
| Statements | 95.6%    | 87/91   |
| Branches   | 92.85%   | 39/42   |
| Functions  | 100%     | 12/12   |
| Lines      | 95.6%    | 87/91   |

## Installation

```bash
# Install dependencies
npm install

# Install dev dependencies
npm install --save-dev mocha chai sinon sinon-chai nyc
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Generate HTML coverage report
npm run test:report
```

## Test Structure

```
test/
└── seguros-contract.test.js
    ├── Policy Management Tests
    │   ├── crearPoliza()
    │   ├── consultarPoliza()
    │   ├── renovarPoliza()
    │   └── cancelarPoliza()
    ├── Claims Management Tests
    │   ├── registrarReclamacion()
    │   └── procesarReclamacion()
    ├── Utility Function Tests
    │   ├── calcularPrima()
    │   └── obtenerHistorialPoliza()
    ├── Private Data Tests
    │   ├── guardarDatosPrivados()
    │   └── obtenerDatosPrivados()
    └── Error Handling Tests
        ├── putState errors
        └── getState errors
```

## Key Testing Patterns

### 1. Mocking Fabric Context

```javascript
beforeEach(() => {
  contract = new SegurosContract();
  stubStub = sinon.createStubInstance(ChaincodeStub);
  ctx = { stub: stubStub };
});
```

### 2. Testing Successful Operations

```javascript
it("should create a new policy", async () => {
  stubStub.putState.resolves();
  const result = await contract.crearPoliza(
    ctx,
    id,
    titular,
    tipo,
    valor,
    duracion
  );
  expect(JSON.parse(result)).to.have.property("ID").that.equals(id);
});
```

### 3. Testing Error Scenarios

```javascript
it("should throw error if policy doesn't exist", async () => {
  stubStub.getState.resolves(null);
  try {
    await contract.consultarPoliza(ctx, "POL999");
    expect.fail("Expected error");
  } catch (error) {
    expect(error.message).to.equal("La póliza POL999 no existe");
  }
});
```

## Test Cases Summary

### Policy Management

- ✅ Create new policy with valid parameters
- ✅ Query existing policy by ID
- ✅ Throw error when querying non-existent policy
- ✅ Renew existing policy with new duration
- ✅ Cancel policy with reason
- ✅ Handle policy not found errors

### Claims Management

- ✅ Register new claim for existing policy
- ✅ Process pending claim with approval/rejection
- ✅ Throw error for non-existent claim
- ✅ Update claim status and add comments

### Premium Calculation

- ✅ Calculate premium for Auto insurance (5% base rate)
- ✅ Calculate premium for Home insurance (2% base rate)
- ✅ Calculate premium for Life insurance (1% base rate)
- ✅ Apply risk factors (Low: 0.8, Medium: 1.0, High: 1.5)

### Private Data

- ✅ Store private data in private collection
- ✅ Retrieve private data by policy ID
- ✅ Handle missing private data errors

### Error Handling

- ✅ Catch and propagate ledger write errors
- ✅ Catch and propagate ledger read errors
- ✅ Validate required parameters

## Coverage Report

The coverage report can be viewed in two ways:

1. **Console Output**: Run `npm run test:coverage`
2. **HTML Report**: Run `npm run test:report` and open `coverage/index.html`

## Best Practices

1. **Isolation**: Each test is completely isolated using fresh mocks
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Error Testing**: Both success and failure paths are tested
4. **Mock Verification**: Verify that mocks are called with correct parameters
5. **Async Handling**: Proper handling of promises and async operations

## Contributing

1. Write tests before implementing new features (TDD)
2. Maintain coverage above 95%
3. Follow existing test patterns
4. Add appropriate test descriptions
5. Test both success and error scenarios
6. Use meaningful variable names in tests

## Future Improvements

- [ ] Add integration tests
- [ ] Implement CI/CD pipeline with GitHub Actions
- [ ] Add performance benchmarks
- [ ] Create end-to-end test scenarios
- [ ] Add security testing
- [ ] Implement mutation testing
- [ ] Add load testing for concurrent operations
- [ ] Create test data generators

## Troubleshooting

### Common Issues

1. **Tests failing with "rejectedWith" error**

   - Solution: Use try/catch blocks instead of chai-as-promised

2. **Coverage not reaching 100%**

   - Check for untested edge cases
   - Look for default switch cases
   - Verify all error conditions are tested

3. **Mock not working as expected**
   - Ensure stubs are properly reset in `beforeEach`
   - Verify mock setup matches actual usage

## License

ISC

## Author

CallejaJ

## Related Documentation

- [Hyperledger Fabric Testing Guide](https://hyperledger-fabric.readthedocs.io/en/latest/testing.html)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon.JS Documentation](https://sinonjs.org/)
- [NYC Coverage Tool](https://github.com/istanbuljs/nyc)
