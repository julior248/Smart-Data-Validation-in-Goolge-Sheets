function getDvObject(ObjEdit) {

  var DvInfo = getPropertyAsArray(C_USER_PROPERTY_DV); 
  /*
    {d={0Data Sample-1;2;3;5=
      {s=>, d={... Yulab={Putesh=[ASU, Niatirb], Zalip=[Duantan]}}}, 
      f=0, 
      h=[Planet, Mainland, Country, City], 
      l=4, n=Data Sample}, 
      0Data Sample2-1;6;7;8=
      {s=>, d={...[Dallas, New York, San Francisco, Chicago]}}, ...}, 
     w={
      Work Sample={0Data Sample-1;2;3;5={r=5, c=[1, 2, 3, 5]}}, 
      1 To many Sample={0Data Sample2-1;6;7;8={r=2, c=[1, 6, 7, 8]}}}}  
  */
  
  var sheets = Object.keys(DvInfo.w); // [Work Sample, 1 To many Sample]
  
  // step 1. Get rid of wrong sheet
  var nameSheet = ObjEdit.nameSheet; // 1 To many Sample
  if (sheets.indexOf(nameSheet) === -1) { return null; } // wrong sheet
  
  var result = {};
   
  // step 2. get connections
  var workSheet = DvInfo.w[nameSheet];  // {0Data Sample2-1;6;7;8={r=2, c=[1, 6, 7, 8]}}
  var connections = getListDvConnections(ObjEdit, workSheet);
  if (connections === null) { return null; } // no range matches
  
  // step 3. get dataSets  
  var result = {};  
  result.connections = connections;  
  var dataSets = getDvDataSets(connections, DvInfo.d);
  result.dataSets = dataSets;
  

  return result; // {"connections":[{"r":5,"c":[1,2,3,5],"columnsChanged":[2,3,5],"name":"0Data Sample"}],
                 //  "dataSets":{"0Data Sample":{"n":"Data Sample","d":{"Earth":{"Europe":{"Britain":...}},"h":["Planet","Mainland","Country","City"],"l":4,"s":">","f":0}}}    
  
}


function getListDvConnections(ObjEdit, workSheet)
{
  var list = Object.keys(workSheet); // [0Data Sample2-1;6;7;8]   
  // workSheet =         {0Data Sample2-1;6;7;8={r=2, c=[1, 6, 7, 8]}}
  
  var result = [];
  var nameConn = '';
  for (var i = 0, l = list.length; i < l; i++)
  {
    nameConn = list[i]; 
    var conn = workSheet[nameConn];  // {"r":5,"c":[1,2,3,5]}
    var connAdd = getDvConnection(conn, ObjEdit); // check ranges  
    if (connAdd !== null) {
      connAdd.name = nameConn; // add name of data for future use
      result.push(connAdd); // {"r":5,"c":[1,2,3,5],"columnsChanged":[5,3],"name":"0Data Sample"}     
    }    
  }
  
  if (result.length === 0) return null;
  
  return result;
  

}


function getDvConnection(conn, ObjEdit)
{

    // Step 1. Get rid of wrong row
    if ( ObjEdit.getLastRow <= conn.r ) { return null; } // wrong row

    // Step 2. Get rid of wrong columns
    var columnsChanged = [];
    
    columnsChanged = arrayIntersection(conn.c, ObjEdit.columns).sort(function(a,b) { return a - b; } );
    
    if (columnsChanged.length === 0) { return null; } // wrong columns
    Logger.log(1000);
    
    conn.columnsChanged = columnsChanged;
    
    return conn;
    
}

function getDvDataSets(connections, dataSets)
{
  var result = {};
  var name = '';
  
  for (var i = 0, l = connections.length; i < l; i++)
  {
    name = connections[i].name;
    result[name] = dataSets[name];  
  }
  
  return result;

}
