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
		add_option( po_dock,					"dock,d",
			boost::program_options::value<std::string>()->default_value("left"),				"Dock screen side", desc ).
		add_option( po_alignment,				"aligmnent,a",
			boost::program_options::value<int>()->default_value(1),								"Side aligment", desc ).
		add_option( po_transparency,			"transparency,t",
			boost::program_options::value<unsigned char>()->default_value(255-64),					"Window trancparency", desc );
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
	RECT rect;
	DWORD const style = WS_OVERLAPPED | /*WS_CLIPCHILDREN | */WS_CLIPSIBLINGS;
	DWORD const ex_style = WS_EX_TOPMOST | WS_EX_TOOLWINDOW | WS_EX_LAYERED;
	struct _{
		static bool __( WNDCLASSEX& wcex, CREATESTRUCT& cs, RECT const& rect, DWORD const style, DWORD const ex_style ) {
			wcex.cbSize;
			wcex.style			=	0/*CS_HREDRAW | CS_VREDRAW*/;
			wcex.lpfnWndProc;
			wcex.cbClsExtra;
			wcex.cbWndExtra;
			wcex.hInstance;
			wcex.hIcon;
			wcex.hCursor;
			wcex.hbrBackground	=	(HBRUSH)GetStockObject( BLACK_BRUSH );
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
	SetRect( &rect, 0, 0, 64, 256 );
	window::calc_rect( rect, style, ex_style, false, true, false );
	if ( this->w.init( boost::bind( _::__, _1, _2, boost::ref( rect ), style, ex_style ), true ) )
	{
		this->w.set_styles( style, ex_style ).set_alpha( po.as< unsigned char >( po_transparency ) );
		//CreateWindow( "BUTTON", "Push", WS_VISIBLE | WS_CHILD, 10, 10, 100, 20, this->w.get_hwnd(), NULL, NULL, 0 );
		this->w.show( true ).invalidate().run();
	}
}
