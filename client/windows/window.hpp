#pragma once
#include <atom/util/wwindow.hpp>

class window;
ATOM_DEF_ONLBUTTONDOWN( window )
ATOM_DEF_ONLBUTTONUP( window )
ATOM_DEF_ONMOUSEMOVE( window )
ATOM_DEF_ONCLOSE( window )

class window : public atom::wwindow< window, LOKI_TYPELIST_4( onlbuttondown_pair_t, onlbuttonup_pair_t, onmousemove_pair_t, onclose_pair_t ) >
{
public:
	///
	window() : wwindow( *this, INITLIST_4( &window::onlbuttondown, &window::onlbuttonup, &window::onmousemove, &window::onclose ) ) {
	}
	///
	void
		onlbuttondown( HWND hWnd, BOOL fDoubleClick, int x, int y, UINT keyFlags );
	///
	void
		onlbuttonup( HWND hWnd, int x, int y, UINT keyFlags );
	///
	void
		onmousemove( HWND hWnd, int x, int y, UINT keyFlags );
	///
	void
		onclose( HWND hWnd );

protected:
private:
};