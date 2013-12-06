#include "./pch.hpp"
#include "./appl.hpp"


int main( int argc, char *argv[] )
{
	{
		appl app( std::cout );
		if ( app.init( argc, argv ) )
			app.run();
	}
	return 0;
}
