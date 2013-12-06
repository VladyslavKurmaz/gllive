# Inc/Lib
include_directories( "$ENV{DPM_BOOST-1.54.0_HOME}" )
link_directories( "$ENV{DPM_BOOST-1.54.0_LIB}" )

include_directories( "$ENV{DPM_LOKI-0.1.7_INC}" )

include_directories( "$ENV{DPM_CPP-ATOM_INC}" )

# Project's structure
add_executable( 
	gltouch
	"./pch.cpp"
	"./gltouch.cpp"
	"./appl.cpp"
	"./window.cpp"
)