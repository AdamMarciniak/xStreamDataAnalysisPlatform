'use strict';
//Mario Solorzano
//ME 415 Kinematics
//October 2015
class VectorFourBar{
    constructor(){
        this.type = 'VectorMethod';

        this.constants = {
            K1: 0,
            K2: 0,
            K3: 0,
            K4: 0,
            K5: 0,
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0
        }

        this.linkage = {
            input: '',
            coupler: '',
            output: '',
            ground: '',
            thetaTwo: '',
            thetaThree: {},
            thetaFour: {},
            vectorInput:{},
            vectorCoupler:{
                open: {},
                crossed: {},
            },
            vectorOutput:{
                open: {},
                crossed: {}
            }
        }
    }

    linkageType(input,coupler,output,ground){
        let temp;
        let swap = true;
        let tempArray = [];
        let j = 0;

        const LINKS = 4;

        for (let i = 0; i < LINKS; i++ ){
            tempArray[i] = arguments[i];
        }

        while(swap == true){
            swap = false;
            j++;
            for (let i = 0; i < tempArray.length - j; i++){
                if(tempArray[i] > tempArray[i+1]){
                    temp = tempArray[i];
                    tempArray[i] = tempArray[i+1];
                    tempArray[i+1] = temp;
                    swapped = true
                }
            }
        }

        let setup = {
            S : tempArray[0],
            L : tempArray[3],
            Q : tempArray[1],
            P : tempArray[2]
        }

        let cases = {
            one: ((setup.S + setup.L) < (setup.P + setup.Q)),
            two: ((setup.S + setup.L) > (setup.P + setup.Q)),
            three: ((setup.S + setup.L) == (setup.P + setup.Q))
        }

        let general;

        if (cases.one){
            general = 'Case I';
        }else if (cases.two){
            general = 'Case II';
        }else if (cases.three) {
            general = 'Case III';
        }

        if(cases.one && (setup.S == ground)){
            return 'Grashof Crank-Crank-Crank';
        }else if (cases.three && (setup.S == setup.L && setup.L == setup.P && setup.P ==setup.Q)) {
            return 'Tripple Change Point';
        }else if (cases.three && (setup.S == setup.L || setup.S == setup.P || setup.S == setup.Q || setup.L == setup.Q || setup.L == setup.P || setup.Q == setup.P)) {
            return 'Double Change Point';
        }else if(cases.one && (setup.S == input)){
            return 'Grashof Crank-Rocker-Rocker';
        }else if(cases.one && (setup.S == coupler)){
            return 'Grashof Rocker-Crank-Rocker';
        }else if(cases.one && (setup.S == output)){
            return 'Grashof Rocker-Rocker-Crank';
        }else if(cases.two && (setup.L == ground)){
            return 'Class 1 Rocker-Rocker-Rocker';
        }else if (cases.two && (setup.L == input)) {
            return 'Class 2 Rocker-Rocker-Rocker';
        }else if (cases.two && (setup.L == coupler)) {
            return 'Class 3 Rocker-Rocker-Rocker';
        }else if (cases.two && (setup.L == output) ) {
            return 'Class 4 Rocker-Rocker-Rocker';
        }else if (cases.three && (setup.S == ground)) {
            return 'Change Point Crank-Crank-Crank';
        }else if (cases.three && (setup.S == input)) {
            return 'Change Point Crank-Rocker-Rocker';
        }else if (cases.three && (setup.S == coupler)) {
            return 'Change Point Rocker-Crank-Rocker';
        }else if (cases.three && (setup.S == output)) {
            return 'Change Point Rocker-Rocker-Crank';
        }else {
            return(`Not Part of Barker's 14 ${general}`);
        }
    }

    couplerAngle(input,coupler,output,ground,thetaTwo){
        let temp = Object.keys(this.linkage);
        for(let i in arguments){
            this.linkage[temp[i]] = arguments[i];
        }

        if(!this.errorCheck()){
            return;
        }

        this.getConstantsK();
        this.getConstantsTierD();

        this.linkage.thetaThree = this.modQuadratic(this.constants.D, this.constants.E, this.constants.F);

        return this.linkage.thetaThree;
    }

    outputAngle(input,coupler,output,ground,thetaTwo){
        let temp = Object.keys(this.linkage);
        for(let i in arguments){
            this.linkage[temp[i]] = arguments[i];
        }

        if(!this.errorCheck(this.linkage)){
            return;
        }

        this.getConstantsK(this.linkage);
        this.getConstantsTierA(this.linkage);

        this.linkage.thetaFour = this.modQuadratic(this.constants.A, this.constants.B, this.constants.C);

        return this.linkage.thetaFour;
    }

    inputVector(input,coupler,output,ground,thetaTwo, delta){
        if(!delta){
            delta = 0;
        }

        this.getCouplerAngle(input,coupler,output,ground,thetaTwo);

        if(typeof(this.linkage.thetaThree) == 'string' ){
            return 'Not a Possible Configuration';
        }

        this.linkage.vectorInput.Re = (input * (Math.cos(thetaTwo + delta)));
        this.linkage.vectorInput.Im = (input * (Math.sin(thetaTwo + delta)));

        return this.linkage.vectorInput;
    }

    couplerVector(input,coupler,output,ground,thetaTwo, delta){

        if(!delta){
            delta = 0;
        }

        this.getCouplerAngle(input,coupler,output,ground,thetaTwo);

        if(typeof(this.linkage.thetaThree) == 'string' ){
            return 'Not a Possible Configuration';
        }

        this.linkage.vectorCoupler.open.Re = (coupler * (Math.cos(this.linkage.thetaThree.open + delta)));
        this.linkage.vectorCoupler.open.Im = (coupler * (Math.sin(this.linkage.thetaThree.open + delta)));

        this.linkage.vectorCoupler.crossed.Re = (coupler * (Math.cos(this.linkage.thetaThree.crossed + delta)));
        this.linkage.vectorCoupler.crossed.Im = (coupler * (Math.sin(this.linkage.thetaThree.crossed + delta)));

        return this.linkage.vectorCoupler;
    }

    outputVector(input,coupler,output,ground,thetaTwo, delta){

        if(!delta){
            delta = 0;
        }

        this.outputAngle(input,coupler,output,ground,thetaTwo);

        if(typeof(this.linkage.thetaFour) == 'string' ){
            return 'Not a Possible Configuration';
        }

        this.linkage.vectorOutput.open.Re = (coupler * (Math.cos(this.linkage.thetaFour.open + delta)));
        this.linkage.vectorOutput.open.Im = (coupler * (Math.sin(this.linkage.thetaFour.open + delta)));

        this.linkage.vectorOutput.crossed.Re = (coupler * (Math.cos(this.linkage.thetaFour.crossed + delta)));
        this.linkage.vectorOutput.crossed.Im = (coupler * (Math.sin(this.linkage.thetaFour.crossed + delta)));

        return this.linkage.vectorOutput;
    }

    transmissionAngle(input,coupler,output,ground,thetaTwo){
        this.couplerAngle(input,coupler,output,ground,thetaTwo);
        this.outputAngle(input,coupler,output,ground,thetaTwo);

        let transmissionAngles = {};

        if((typeof(this.linkage.thetaThree) != 'string') && (typeof(this.linkage.thetaFour) != 'string')){
            transmissionAngles.open = Math.abs(this.linkage.thetaThree.open - this.linkage.thetaFour.open);
            transmissionAngles.crossed = Math.abs(this.linkage.thetaThree.crossed - this.linkage.thetaFour.crossed);

            if(transmissionAngles.open > (Math.PI/2)){
                transmissionAngles.open = (Math.PI - transmissionAngles.open);
            }

            if(transmissionAngles.crossed > (Math.PI/2)){
                transmissionAngles.crossed = (Math.PI - transmissionAngles.crossed);
            }

            return transmissionAngles;

        }else{
            return 'invalid linkage';
        }
    }

    getConstantsK(){
        this.constants.K1 = (this.linkage.ground/this.linkage.input);
        this.constants.K2 = (this.linkage.ground/this.linkage.output);
        this.constants.K3 = ((Math.pow(this.linkage.input,2)-Math.pow(this.linkage.coupler,2) + Math.pow(this.linkage.output,2) + Math.pow(this.linkage.ground,2))/(2*this.linkage.input*this.linkage.output));
        this.constants.K4 = (this.linkage.ground/this.linkage.coupler);
        this.constants.K5 = ((Math.pow(this.linkage.output,2)-Math.pow(this.linkage.ground,2) - Math.pow(this.linkage.input,2) - Math.pow(this.linkage.coupler,2))/( 2 * this.linkage.input * this.linkage.coupler));
    }

    getConstantsTierA(){
        this.constants.A = ( Math.cos(this.linkage.thetaTwo) - (this.constants.K1) - (this.constants.K2 * Math.cos(this.linkage.thetaTwo)) + (this.constants.K3)); // Radians
        this.constants.B = (-2 * Math.sin(this.linkage.thetaTwo));
        this.constants.C = (this.constants.K1 - ((this.constants.K2 + 1) * Math.cos(this.linkage.thetaTwo)) + this.constants.K3);
    }

    getConstantsTierD(){
        this.constants.D = ( Math.cos(this.linkage.thetaTwo) - (this.constants.K1) + (this.constants.K4 * Math.cos(this.linkage.thetaTwo)) + (this.constants.K5)); // Radians
        this.constants.E = (-2 * Math.sin(this.linkage.thetaTwo));
        this.constants.F = (this.constants.K1 + ((this.constants.K4 - 1) * Math.cos(this.linkage.thetaTwo)) + this.constants.K5);
    }

    modQuadratic(A,B,C){
        if( Math.pow(B,2) - (4 * A * C) < 0){
            return 'Not a Possible Configuration';
        }

        var temp = {};
        temp.crossed = (2 * Math.atan((-B + Math.sqrt( Math.pow(B,2) - (4 * A * C) ))/( 2 * A)));
        temp.open = (2* Math.atan((-B - Math.sqrt( Math.pow(B,2) - (4 * A * C) ))/( 2 * A)));

        return temp;
    }

    errorCheck(){

        if (!this.linkage.input || !this.linkage.coupler || !this.linkage.output || !this.linkage.ground || !this.linkage.thetaTwo){
            console.log('Must Provide Linkage Lengths and Input Angle for a Solution');
            return false;
        }else if(
            typeof(this.linkage.input) !== 'number'
            ||typeof(this.linkage.coupler) !== 'number'
            ||typeof(this.linkage.output) !== 'number'
            ||typeof(this.linkage.ground) !== 'number'
            ||typeof(this.linkage.thetaTwo) !== 'number'
        ){
            console.log('Incorrect Parameter Type');
            return false;
        }else {
            return true;
        }
    }
}

module.exports = VectorFourBar;
