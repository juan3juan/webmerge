const ZCRMRestClient = require("zcrmsdk");

module.exports = {
  mappingData: async function(input, caseInfoData) {
    //these two are the output of the function
    let integrateData = {}; //integrate data from different modules
    let testfile = {}; //choose testfile

    let testfile_G28_I765_test = {
      id: 323297,
      key: "4mxuat"
    };

    let G28_I131 = {
      id: 394665,
      key: "szph16"
    };

    if (input.document == "G28_I765_test") {
      testfile = testfile_G28_I765_test;
      //obtain company & client info through case info record
      //extract company data
      let companyId = caseInfoData.Related_Company.id;
      let inputCompany = {};
      inputCompany.id = companyId;
      inputCompany.module = "Accounts";
      const respCompany = await ZCRMRestClient.API.MODULES.get(inputCompany);
      let companyData = JSON.parse(respCompany.body).data[0];
      console.log("companyData.Account_Name :" + companyData.Account_Name);
      //extract client data
      let clientId = caseInfoData.Related_Client.id;
      let inputClient = {};
      inputClient.id = clientId;
      inputClient.module = "Contacts";
      const respClient = await ZCRMRestClient.API.MODULES.get(inputClient);
      let clientData = JSON.parse(respClient.body).data[0];
      console.log("clientData.Email :" + clientData.Email);
      //extract related case data
      let caseId = caseInfoData.Related_Case.id;
      let inputCase = {};
      inputCase.id = caseId;
      inputCase.module = "Deals";
      const respCase = await ZCRMRestClient.API.MODULES.get(inputCase);
      let caseData = JSON.parse(respCase.body).data[0];
      console.log("caseData.Case_Number :" + caseData.Case_Number);

      integrateData.G28_P3_6a_FamilyName = clientData.Last_Name;
      integrateData.G28_P3_6b_GivenName = clientData.First_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.P2_10_Gender = clientData.Gender;
      integrateData.P2_11_MaritalStatus = clientData.Marital_Status;
      integrateData.P2_13b_ssn = clientData.SSN;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P1_13b = clientData.Mailing_Unit;
      integrateData.G28_P1_3b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P1_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P1_13d_State = clientData.Mailing_State;
      integrateData.G28_P1_13e_ZIPCode = clientData.Mailing_Zip;
      integrateData.P2_5a_InCareOfName =
        clientData.First_Name + " " + clientData.Last_Name;
      integrateData.P2_16a_FatherFamilyName = clientData.Father_s_Last_Name;
      integrateData.P2_16b_FatherFirstName = clientData.Father_s_First_Name;
      integrateData.P2_17a_MotherFamilyName = clientData.Mother_s_Last_Name;
      integrateData.P2_17b_MotherFirstName = clientData.Mother_s_First_Name;
      integrateData.P2_18a_Country = clientData.Country_of_Citizenship;
      integrateData.P2_19a_CityTownVillageOfBirth = clientData.City_of_Birth;
      integrateData.P2_19b_StateProvinceOfBirth = clientData.Province_of_Birth;
      integrateData.P2_19c_CountryOfBirth = clientData.Country_of_Birth;
      integrateData.P2_20_DOB = clientData.Date_of_Birth;
      integrateData.P2_21a_I94 = clientData.I_94_No;
      integrateData.P2_21b_PassportNumber = clientData.Passport_Number;
      integrateData.P2_21e_ExpirationDateforPassport =
        clientData.Date_Passport_Expired;
      integrateData.P2_22_DateLastArrivalUS = clientData.Date_of_Last_Entry;
      integrateData.P2_23_PlaceLastArrivalUS = clientData.Place_of_Last_Entry;
      integrateData.P2_24_statusLastArrival = clientData.Status_of_Last_Entry;
      integrateData.P2_25_statusCurrent = clientData.Current_Status;
      // special process for ANumber, remove blank and A/a in the front
      let ANumber = clientData.A_Number;
      ANumber = ANumber.trim().replace(/\s/g, ""); //remove blank front, end and between
      if (ANumber !== null || ANumber !== "") {
        if (ANumber.charAt(0) === "A" || ANumber.charAt(0) === "a")
          ANumber = ANumber.substring(1);
      }
      integrateData.G28_P3_9_ClientANumber = ANumber;

      // special process for SEVIS, remove blank and N/n in the front
      let SEVIS = clientData.SEVIS_No;
      SEVIS = SEVIS.trim().replace(/\s/g, ""); //remove blank front, end and between
      if (SEVIS !== null || SEVIS !== "") {
        if (SEVIS.charAt(0) === "N" || SEVIS.charAt(0) === "n")
          SEVIS = SEVIS.substring(1);
      }
      integrateData.P2_26_SEVIS = SEVIS;

      // from company
      integrateData.P2_28b_EmployersName = companyData.Account_Number;
      integrateData.P2_28c_EmployersID = companyData.E_Verify_ID;
      // from caseInfo
      integrateData.P2_27_EligibilityCategory =
        caseInfoData.Eligibility_Category;
      integrateData.P2_28a_Degree = caseInfoData.Type_of_U_S_Degree;
      integrateData.P2_13a_ssnBefore = caseInfoData.Has_SSA;
      integrateData.P2_12_I765Before =
        caseInfoData.Ever_Filled_a_Petition_for_this_Beneficiary;
      integrateData.P5_1a_PreparersFamilyName = caseInfoData.Preparer_Last_Name;
      integrateData.P5_1b_PreparersFirstName = caseInfoData.Preparer_First_Name;
    } else if (input.document == "G28_I131") {
      testfile = G28_I131;
      //obtain company & client info through case info record
      //extract company data
      let companyId = caseInfoData.Related_Company.id;
      let inputCompany = {};
      inputCompany.id = companyId;
      inputCompany.module = "Accounts";
      const respCompany = await ZCRMRestClient.API.MODULES.get(inputCompany);
      let companyData = JSON.parse(respCompany.body).data[0];
      console.log("companyData.Account_Name :" + companyData.Account_Name);
      //extract client data
      let clientId = caseInfoData.Related_Client.id;
      let inputClient = {};
      inputClient.id = clientId;
      inputClient.module = "Contacts";
      const respClient = await ZCRMRestClient.API.MODULES.get(inputClient);
      let clientData = JSON.parse(respClient.body).data[0];
      console.log("clientData.Email :" + clientData.Email);
      //extract related case data
      let caseId = caseInfoData.Related_Case.id;
      let inputCase = {};
      inputCase.id = caseId;
      inputCase.module = "Deals";
      const respCase = await ZCRMRestClient.API.MODULES.get(inputCase);
      let caseData = JSON.parse(respCase.body).data[0];
      console.log("caseData.Case_Number :" + caseData.Case_Number);

      integrateData.G28_P3_6a_FamilyName = clientData.First_Name;
      integrateData.G28_P3_6b_GivenName = clientData.Last_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P1_13b = clientData.Mailing_Unit;
      integrateData.G28_P1_3b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P1_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P1_13d_State = clientData.Mailing_State;
      integrateData.G28_P1_13e_ZIPCode = clientData.Mailing_Zip;
      integrateData.P1_2i_Country = clientData.Mailing_Country;
      integrateData.P1_4_CountryOfBirth = clientData.Country_of_Birth;
      integrateData.P1_5_CountryOfCitizenship =
        clientData.Country_of_Citizenship;
      integrateData.P1_7_Gender = clientData.Gender;
      integrateData.P1_8_DOB = clientData.Date_of_Birth;
      integrateData.P1_9_SSN = clientData.SSN;

      // special process for ANumber, remove blank and A/a in the front
      let ANumber = clientData.A_Number;
      ANumber = ANumber.trim().replace(/\s/g, ""); //remove blank front, end and between
      if (ANumber !== null || ANumber !== "") {
        if (ANumber.charAt(0) === "A" || ANumber.charAt(0) === "a")
          ANumber = ANumber.substring(1);
      }
      console.log("ANumber : " + ANumber);
      integrateData.G28_P3_9_ClientANumber = ANumber;

      integrateData.P2_2a_FamilyName = clientData.Mailing_City;
      integrateData.G28_P1_13d_State = clientData.Mailing_State;
      integrateData.G28_P1_13e_ZIPCode = clientData.Mailing_Zip;
      integrateData.G28_P3_9_ClientANumber = clientData.A_Number;
    }
    return [integrateData, testfile];
  }
};
