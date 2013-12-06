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
	static const atom::po::id_t	po_dock					=	po_help + 1;
	static const atom::po::id_t	po_alignment			=	po_dock + 1;
	static const atom::po::id_t	po_transparency			=	po_alignment + 1;

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