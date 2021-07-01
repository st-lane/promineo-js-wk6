var expect = chai.expect;

// this is a grouping of test cases
describe('UnitTestGroupName', function(){
    // this is a group of test cases for the doSomething function
    describe("#doSomething", function(){
        // this is a test case - success
        it('should concat 2 params as string',function(){
            var x = doSomething ('Hello', 5);
            expect(x).to.equal('Hello5');
        });

        // this is another test case - error
        it('should throw error if p1 is not a string',function(){
            expect( function(){
                doSomething(5,5);
                } ).to.throw(Error);
        });


        // this is another test case - setup error
        it('should throw error?? ',function(){
            expect( function(){
                doSomething();
                } ).to.throw(Error);
        });

    });

});