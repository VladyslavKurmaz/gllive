#pragma once
#include <boost/function.hpp>
#include <boost/thread.hpp>
#include <boost/smart_ptr.hpp>

#include <atom/util/po.hpp>

#include "./window.hpp"

class appl
{
public:
	///
	appl( std::ostream& l );
	///
	~appl();
	///
	bool
		init( int argc, char const * const argv[] );
	///
	void
		run();

protected:
	static const atom::po::id_t	po_desc					=	1;
	static const atom::po::id_t	po_help					=	po_desc + 1;
	static const atom::po::id_t	po_host					=	po_help + 1;
	static const atom::po::id_t	po_port					=	po_host + 1;
	static const atom::po::id_t	po_wifi_scan			=	po_port + 1;
	static const atom::po::id_t	po_gui					=	po_wifi_scan + 1;
	static const atom::po::id_t	po_gui_width			=	po_gui + 1;
	static const atom::po::id_t	po_gui_height			=	po_gui_width + 1;
	static const atom::po::id_t	po_move					=	po_gui_height + 1;

private:
	///
	std::ostream&
		log;
	///
	atom::po
		po;
	///
	window 
		w;
};