#include "./pch.hpp"
#include "./appl.hpp"

appl::appl( std::ostream& l ) :
		log( l )
	,	po()
	,	w()
{
	atom::po::options_description_t& desc = this->po.add_desc( po_desc, "program options" );
	//
	po.
		add_option( po_help,					"help",											"Show this help", desc ).
		add_option( po_host,					"host",
			boost::program_options::value<std::string>()->default_value("127.0.0.1"),		"Map service address", desc ).
		add_option( po_port,					"port",
			boost::program_options::value<std::string>()->default_value("8000"),				"Map service port", desc ).
		add_option( po_wifi_scan,				"scan",
			boost::program_options::value<int>()->default_value(1000),							"Wifi scan timeout (<=0 disable)", desc ).
		add_option( po_gui,						"gui",
			boost::program_options::value<std::string>()->default_value(""),					"Display GUI: '' | '2d' | '3d'", desc ).
		add_option( po_gui_width,				"width",
			boost::program_options::value<unsigned int>()->default_value(800),					"GUI window width", desc ).
		add_option( po_gui_height,				"height",
			boost::program_options::value<unsigned int>()->default_value(600),					"GUI window height", desc ).
		add_option( po_move,					"move",											"Move object", desc );
}

appl::~appl()
{
}

bool appl::init( int argc, char const * const argv[] )
{
	atom::po::options_description_t& desc = this->po.get_desc( po_desc );
	try
	{
		this->po.parse_arg( argc, argv, desc, true );
		//
		if ( po.count( po_help ) )
			throw std::exception( "Maps command line parameters are:" );
	}
	catch( std::exception& exc )
	{
		std::stringstream ss;
		desc.print( ss );
		this->log << exc.what() << std::endl;
		this->log << ss.str() << std::endl;
		return false;
	}
	return true;
}

void appl::run() {
	//
	std::string const gui = this->po.as<std::string>( po_gui );
	if ( gui.length() )
	{
		if ( gui == "3d" )
		{

			RECT rect;
			DWORD const style = WS_OVERLAPPED | WS_SYSMENU | WS_CAPTION;
			DWORD const ex_style = WS_EX_APPWINDOW;
			struct _
			{
				static bool __( WNDCLASSEX& wcex, CREATESTRUCT& cs, RECT const& rect, DWORD const style, DWORD const ex_style )
				{
					wcex.cbSize;
					wcex.style;
					wcex.lpfnWndProc;
					wcex.cbClsExtra;
					wcex.cbWndExtra;
					wcex.hInstance;
					wcex.hIcon;
					wcex.hCursor;
					wcex.hbrBackground;
					wcex.lpszMenuName;
					wcex.lpszClassName;
					wcex.hIconSm;
					//
					cs.lpCreateParams;
					cs.hInstance;
					cs.hMenu;
					cs.hwndParent;
					cs.cy				=	rect.bottom - rect.top;
					cs.cx				=	rect.right - rect.left;
					cs.y				=	rect.top;
					cs.x				=	rect.left;
					cs.style			=	style;
					cs.lpszName;
					cs.lpszClass;
					cs.dwExStyle		=	ex_style;
					return true;
				}
			};
			SetRect( &rect, 0, 0, this->po.as<unsigned int>(po_gui_width), this->po.as<unsigned int>(po_gui_height) );
			window::calc_rect( rect, style, ex_style, false, true );
			if ( this->w.init( boost::bind( _::__, _1, _2, boost::ref( rect ), style, ex_style ), true ) )
			{
				this->w.show( true );
			}
		}
	}
}


